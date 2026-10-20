"use client";

import { useEffect, useMemo, useState } from "react";

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
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

import { getAllLangganan } from "@/services/langganan.service";

const themePrimaryGradient =
  "bg-[linear-gradient(135deg,var(--color-primary),color-mix(in_srgb,var(--color-primary)_72%,var(--color-info)))]";

const themePrimarySoft =
  "bg-[color-mix(in_srgb,var(--color-primary)_9%,transparent)]";

const themePrimaryText = "text-[var(--color-primary)]";

const themePrimaryShadow =
  "shadow-[0_8px_20px_color-mix(in_srgb,var(--color-primary)_18%,transparent)]";

const themeCardShadow =
  "shadow-[0_4px_18px_color-mix(in_srgb,var(--color-text)_5%,transparent)]";

const themeNeutralSurface =
  "bg-[color-mix(in_srgb,var(--color-text)_4%,transparent)]";

const themeNeutralHover =
  "hover:bg-[color-mix(in_srgb,var(--color-text)_7%,transparent)]";

const themeNeutralBorder =
  "border-[color-mix(in_srgb,var(--color-text)_10%,transparent)]";

const themeDivider =
  "border-[color-mix(in_srgb,var(--color-text)_8%,transparent)]";

const themeInfoSurface =
  "bg-[color-mix(in_srgb,var(--color-info)_8%,transparent)]";

const themeInfoBorder =
  "border-[color-mix(in_srgb,var(--color-info)_22%,transparent)]";

const themeSuccessSurface =
  "bg-[color-mix(in_srgb,var(--color-success)_9%,transparent)]";

const themeSuccessBorder =
  "border-[color-mix(in_srgb,var(--color-success)_24%,transparent)]";

const themeWarningSurface =
  "bg-[color-mix(in_srgb,var(--color-warning)_9%,transparent)]";

const themeWarningBorder =
  "border-[color-mix(in_srgb,var(--color-warning)_24%,transparent)]";

const themeDangerSurface =
  "bg-[color-mix(in_srgb,var(--color-text)_5%,transparent)]";

const themeDangerBorder =
  "border-[color-mix(in_srgb,var(--color-text)_18%,transparent)]";

function formatRupiah(value) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(Number(value) || 0);
}

function formatDate(date) {
  if (!date) return "-";
  const parsedDate = new Date(date);
  if (Number.isNaN(parsedDate.getTime())) return "-";
  return parsedDate.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

function getSubscriptionStatus(item) {
  const status = String(item?.statusLangganan || "").toLowerCase();
  if (status === "active" || status === "trialing") return "Aktif";
  if (status === "expired") return "Expired";
  if (item?.tanggalBerakhir) {
    const endDate = new Date(item.tanggalBerakhir);
    if (!Number.isNaN(endDate.getTime()) && endDate < new Date())
      return "Expired";
  }
  return "Akan Berakhir";
}

function getPaymentStatus(status) {
  const normalized = String(status || "").toLowerCase();
  if (["paid", "berhasil", "success"].includes(normalized)) return "Lunas";
  if (normalized === "pending") return "Pending";
  if (["failed", "gagal"].includes(normalized)) return "Gagal";
  return status || "-";
}

function StatusBadge({ status }) {
  if (status === "Aktif") {
    return (
      <span
        className={`inline-flex items-center gap-1.5 rounded-full border ${themeSuccessBorder} ${themeSuccessSurface} px-3 py-1.5 text-xs font-semibold text-[var(--color-success)]`}
      >
        <CheckCircle2 size={13} />
        Aktif
      </span>
    );
  }
  if (status === "Expired") {
    return (
      <span
        className={`inline-flex items-center gap-1.5 rounded-full border ${themeDangerBorder} ${themeDangerSurface} px-3 py-1.5 text-xs font-semibold theme-text-secondary`}
      >
        <XCircle size={13} className="theme-text-muted" />
        Expired
      </span>
    );
  }
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border ${themeWarningBorder} ${themeWarningSurface} px-3 py-1.5 text-xs font-semibold text-[var(--color-warning)]`}
    >
      <Clock3 size={13} />
      Akan Berakhir
    </span>
  );
}

function PaymentBadge({ status }) {
  if (status === "Lunas") {
    return (
      <span
        className={`inline-flex items-center gap-1.5 rounded-full border ${themeSuccessBorder} ${themeSuccessSurface} px-3 py-1.5 text-xs font-semibold text-[var(--color-success)]`}
      >
        <CheckCircle2 size={13} />
        Lunas
      </span>
    );
  }
  if (status === "Pending") {
    return (
      <span
        className={`inline-flex items-center gap-1.5 rounded-full border ${themeWarningBorder} ${themeWarningSurface} px-3 py-1.5 text-xs font-semibold text-[var(--color-warning)]`}
      >
        <Clock3 size={13} />
        Pending
      </span>
    );
  }
  if (status === "Gagal") {
    return (
      <span
        className={`inline-flex items-center gap-1.5 rounded-full border ${themeDangerBorder} ${themeDangerSurface} px-3 py-1.5 text-xs font-semibold theme-text-secondary`}
      >
        <XCircle size={13} className="theme-text-muted" />
        Gagal
      </span>
    );
  }
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border ${themeNeutralBorder} ${themeNeutralSurface} px-3 py-1.5 text-xs font-semibold theme-text-secondary`}
    >
      {status || "-"}
    </span>
  );
}

function StatCard({ icon: Icon, label, value, description, iconClass, valueClass }) {
  return (
    <div
      className={`min-w-[210px] flex-1 rounded-2xl border theme-border theme-card p-5 ${themeCardShadow}`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-wider theme-text-muted">
            {label}
          </p>
          <p className={`mt-2 text-2xl font-bold ${valueClass || "theme-text"}`}>
            {value}
          </p>
          <p className="mt-1 text-xs theme-text-placeholder">{description}</p>
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

const PAGE_SIZE_OPTIONS = [5, 10, 20, 50];

const SORT_OPTIONS = [
  { key: "sekolah", label: "Nama Sekolah" },
  { key: "paket", label: "Paket" },
  { key: "harga", label: "Harga" },
  { key: "berakhir", label: "Tanggal Berakhir" },
];

export default function LanggananSekolahPage() {
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [sortKey, setSortKey] = useState("sekolah");
  const [sortDir, setSortDir] = useState("asc");

  const [pageSize, setPageSize] = useState(10);
  const [page, setPage] = useState(1);

  const fetchSubscriptions = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await getAllLangganan();
      const formattedData = Array.isArray(data)
        ? data.map((item) => ({
            id: item?.id || "",
            sekolah: item?.sekolah?.nama || item?.namaSekolah || "-",
            kodeSekolah: item?.sekolah?.kode || "-",
            paket: item?.paket?.nama || item?.namaPaket || "-",
            harga: Number(
              item?.hargaSaatBerlangganan ?? item?.harga ?? item?.paket?.harga ?? 0
            ),
            mulai: formatDate(item?.tanggalMulai),
            berakhir: formatDate(item?.tanggalBerakhir),
            berakhirRaw: item?.tanggalBerakhir || null,
            status: getSubscriptionStatus(item),
            pembayaran: getPaymentStatus(item?.statusPembayaran),
            raw: item,
          }))
        : [];
      setSubscriptions(formattedData);
      setPage(1);
    } catch (err) {
      console.error("FETCH LANGGANAN ERROR:", err);
      setSubscriptions([]);
      setError(err?.message || "Gagal mengambil data langganan sekolah.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscriptions();
  }, []);

  const statistics = useMemo(() => {
    const total = subscriptions.length;
    const active = subscriptions.filter((i) => i.status === "Aktif").length;
    const pending = subscriptions.filter((i) => i.pembayaran === "Pending").length;
    const expired = subscriptions.filter((i) => i.status === "Expired").length;
    const totalValue = subscriptions
      .filter((i) => i.pembayaran === "Lunas")
      .reduce((s, i) => s + Number(i.harga || 0), 0);
    return { total, active, pending, expired, totalValue };
  }, [subscriptions]);

  const sortedSubscriptions = useMemo(() => {
    const arr = [...subscriptions];
    const dir = sortDir === "asc" ? 1 : -1;
    arr.sort((a, b) => {
      if (sortKey === "harga") return (a.harga - b.harga) * dir;
      if (sortKey === "berakhir") {
        const ta = a.berakhirRaw ? new Date(a.berakhirRaw).getTime() : 0;
        const tb = b.berakhirRaw ? new Date(b.berakhirRaw).getTime() : 0;
        return (ta - tb) * dir;
      }
      return String(a[sortKey] || "").localeCompare(String(b[sortKey] || "")) * dir;
    });
    return arr;
  }, [subscriptions, sortKey, sortDir]);

  const totalPages = Math.max(1, Math.ceil(sortedSubscriptions.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sortedSubscriptions.slice(start, start + pageSize);
  }, [sortedSubscriptions, currentPage, pageSize]);

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  const toggleSortDir = () => setSortDir((d) => (d === "asc" ? "desc" : "asc"));
  const goPrev = () => setPage((p) => Math.max(1, p - 1));
  const goNext = () => setPage((p) => Math.min(totalPages, p + 1));

  return (
    <div className="theme-page theme-text min-h-full">
      <main className="w-full overflow-x-hidden px-4 py-5 sm:px-6 sm:py-6 lg:px-8 lg:py-8 xl:px-10">
        <div className="mx-auto w-full max-w-[1600px]">

          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex min-w-0 items-center gap-4">
              <div
                className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${themePrimaryGradient} text-[var(--color-card)] ${themePrimaryShadow}`}
              >
                <CreditCard size={23} />
              </div>
              <div className="min-w-0">
                <h1 className="text-2xl font-bold tracking-tight theme-text sm:text-3xl">
                  Data Langganan Sekolah
                </h1>
                <p className="mt-1 text-sm theme-text-muted">
                  Kelola dan pantau seluruh langganan sekolah
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={fetchSubscriptions}
              disabled={loading}
              className={`inline-flex h-11 items-center justify-center gap-2 rounded-xl border ${themeNeutralBorder} ${themeNeutralSurface} px-4 text-sm font-semibold theme-text-secondary transition ${themeNeutralHover} hover:text-[var(--color-primary)] disabled:cursor-not-allowed disabled:opacity-60`}
            >
              <RefreshCw size={17} className={loading ? "animate-spin" : ""} />
              Refresh
            </button>
          </div>

          <div
            className={`mb-6 flex items-start gap-3 rounded-2xl border ${themeInfoBorder} ${themeInfoSurface} p-4`}
          >
            <div
              className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${themeInfoSurface} text-[var(--color-info)]`}
            >
              <ShieldCheck size={18} />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-[var(--color-info)]">
                Data Langganan Sekolah
              </p>
              <p className="mt-1 text-sm leading-relaxed theme-text-secondary">
                Data pada halaman ini diambil langsung dari sistem SmartSchool
                menggunakan endpoint khusus Super Admin.
              </p>
            </div>
          </div>

          {error && (
            <div
              className={`mb-6 flex items-start gap-3 rounded-2xl border ${themeDangerBorder} ${themeDangerSurface} p-4`}
            >
              <div
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${themeNeutralSurface}`}
              >
                <AlertCircle size={18} className="theme-text-secondary" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold theme-text">
                  Gagal mengambil data
                </p>
                <p className="mt-1 text-sm theme-text-secondary">{error}</p>
              </div>
            </div>
          )}

          <section className="mb-6">
            <div className="flex flex-wrap gap-4">
              <StatCard
                icon={CreditCard}
                label="Total Data"
                value={loading ? "..." : statistics.total}
                description="Total langganan sekolah"
                iconClass={`${themePrimarySoft} ${themePrimaryText}`}
              />
              <StatCard
                icon={CheckCircle2}
                label="Aktif"
                value={loading ? "..." : statistics.active}
                description="Langganan aktif"
                iconClass={`${themeSuccessSurface} text-[var(--color-success)]`}
                valueClass="text-[var(--color-success)]"
              />
              <StatCard
                icon={Clock3}
                label="Pending"
                value={loading ? "..." : statistics.pending}
                description="Pembayaran pending"
                iconClass={`${themeWarningSurface} text-[var(--color-warning)]`}
                valueClass="text-[var(--color-warning)]"
              />
              <StatCard
                icon={XCircle}
                label="Expired"
                value={loading ? "..." : statistics.expired}
                description="Langganan berakhir"
                iconClass={`${themeDangerSurface} theme-text-secondary`}
                valueClass="theme-text-secondary"
              />
              <StatCard
                icon={WalletCards}
                label="Nilai Pembayaran"
                value={loading ? "..." : formatRupiah(statistics.totalValue)}
                description="Total pembayaran lunas"
                iconClass={`${themeInfoSurface} text-[var(--color-info)]`}
                valueClass="text-xl text-[var(--color-info)]"
              />
            </div>
          </section>

          <section
            className={`overflow-hidden rounded-2xl border theme-border theme-card ${themeCardShadow}`}
          >
            <div
              className={`flex flex-col gap-3 border-b ${themeDivider} px-5 py-4 sm:px-6 lg:flex-row lg:items-center lg:justify-between`}
            >
              <div>
                <h2 className="text-base font-bold theme-text">
                  Seluruh Data Langganan
                </h2>
                <p className="mt-1 text-xs theme-text-muted">
                  Menampilkan {paginatedData.length} dari {sortedSubscriptions.length} data
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs theme-text-muted">Urut:</span>
                  <select
                    value={sortKey}
                    onChange={(e) => {
                      setSortKey(e.target.value);
                      setPage(1);
                    }}
                    className={`h-9 rounded-lg border ${themeNeutralBorder} ${themeNeutralSurface} px-2 text-xs font-semibold theme-text-secondary outline-none`}
                  >
                    {SORT_OPTIONS.map((o) => (
                      <option key={o.key} value={o.key}>
                        {o.label}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={toggleSortDir}
                    title={sortDir === "asc" ? "Ascending" : "Descending"}
                    className={`inline-flex h-9 items-center gap-1.5 rounded-lg border ${themeNeutralBorder} ${themeNeutralSurface} px-2.5 text-xs font-semibold theme-text-secondary transition ${themeNeutralHover}`}
                  >
                    <ArrowUpDown size={13} />
                    {sortDir === "asc" ? "ASC" : "DESC"}
                  </button>
                </div>

                <div className="flex items-center gap-1.5">
                  <span className="text-xs theme-text-muted">Baris:</span>
                  <select
                    value={pageSize}
                    onChange={(e) => {
                      setPageSize(Number(e.target.value));
                      setPage(1);
                    }}
                    className={`h-9 rounded-lg border ${themeNeutralBorder} ${themeNeutralSurface} px-2 text-xs font-semibold theme-text-secondary outline-none`}
                  >
                    {PAGE_SIZE_OPTIONS.map((n) => (
                      <option key={n} value={n}>
                        {n}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="w-full overflow-x-auto">
              <table className="w-full min-w-[1100px] border-collapse">
                <thead>
                  <tr
                    className={`${themePrimaryGradient} text-left text-xs font-bold uppercase tracking-wider text-[var(--color-card)]`}
                  >
                    <th className="w-[60px] px-4 py-4 text-center">No.</th>
                    <th className="min-w-[220px] px-4 py-4">Sekolah</th>
                    <th className="min-w-[160px] px-4 py-4">Paket</th>
                    <th className="min-w-[150px] px-4 py-4">Harga</th>
                    <th className="min-w-[190px] px-4 py-4">Periode</th>
                    <th className="min-w-[130px] px-4 py-4">Pembayaran</th>
                    <th className="min-w-[130px] px-4 py-4">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={7} className="px-5 py-16 text-center">
                        <div className="flex flex-col items-center">
                          <RefreshCw
                            size={28}
                            className={`animate-spin ${themePrimaryText}`}
                          />
                          <p className="mt-3 text-sm font-semibold theme-text-secondary">
                            Memuat data langganan...
                          </p>
                        </div>
                      </td>
                    </tr>
                  ) : error ? (
                    <tr>
                      <td colSpan={7} className="px-5 py-16 text-center">
                        <div className="mx-auto flex max-w-sm flex-col items-center">
                          <div
                            className={`flex h-14 w-14 items-center justify-center rounded-2xl ${themeDangerSurface} theme-text-secondary`}
                          >
                            <AlertCircle size={25} />
                          </div>
                          <h3 className="mt-4 text-sm font-bold theme-text">
                            Gagal mengambil data
                          </h3>
                          <p className="mt-1 text-xs leading-5 theme-text-muted">
                            {error}
                          </p>
                          <button
                            type="button"
                            onClick={fetchSubscriptions}
                            className={`mt-4 rounded-lg ${themePrimaryGradient} px-4 py-2 text-xs font-semibold text-[var(--color-card)] transition ${themePrimaryShadow} hover:brightness-95`}
                          >
                            Coba Lagi
                          </button>
                        </div>
                      </td>
                    </tr>
                  ) : paginatedData.length > 0 ? (
                    paginatedData.map((item, index) => {
                      const globalIndex =
                        (currentPage - 1) * pageSize + index + 1;
                      return (
                        <tr
                          key={item.id || index}
                          className={`border-b ${themeDivider} transition hover:bg-[color-mix(in_srgb,var(--color-primary)_4%,transparent)]`}
                        >
                          <td className="px-4 py-4 text-center">
                            <span className="text-sm font-semibold theme-text-muted">
                              {globalIndex}
                            </span>
                          </td>
                          <td className="px-4 py-4">
                            <div className="flex items-center gap-3">
                              <div
                                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${themeInfoSurface} text-[var(--color-info)]`}
                              >
                                <ShieldCheck size={18} />
                              </div>
                              <div className="min-w-0">
                                <p className="truncate text-sm font-bold theme-text">
                                  {item.sekolah}
                                </p>
                                <p className="mt-1 text-xs theme-text-placeholder">
                                  {item.kodeSekolah}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-4">
                            <div className="flex items-center gap-3">
                              <div
                                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${themePrimarySoft} ${themePrimaryText}`}
                              >
                                <CreditCard size={17} />
                              </div>
                              <span className="text-sm font-semibold theme-text-secondary">
                                {item.paket}
                              </span>
                            </div>
                          </td>
                          <td className="px-4 py-4">
                            <div className="flex items-center gap-2">
                              <WalletCards size={16} className={themePrimaryText} />
                              <span className="text-sm font-bold theme-text-secondary">
                                {formatRupiah(item.harga)}
                              </span>
                            </div>
                          </td>
                          <td className="px-4 py-4">
                            <div className="flex items-start gap-2">
                              <CalendarDays
                                size={16}
                                className="mt-0.5 shrink-0 theme-text-muted"
                              />
                              <div className="text-xs">
                                <p className="font-semibold theme-text-secondary">
                                  {item.mulai}
                                </p>
                                <p className="mt-1 theme-text-muted">
                                  s/d {item.berakhir}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-4">
                            <PaymentBadge status={item.pembayaran} />
                          </td>
                          <td className="px-4 py-4">
                            <StatusBadge status={item.status} />
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={7} className="px-5 py-16 text-center">
                        <div className="mx-auto flex max-w-sm flex-col items-center">
                          <div
                            className={`flex h-14 w-14 items-center justify-center rounded-2xl ${themeNeutralSurface} theme-text-muted`}
                          >
                            <CreditCard size={25} />
                          </div>
                          <h3 className="mt-4 text-sm font-bold theme-text">
                            Belum ada data langganan
                          </h3>
                          <p className="mt-1 text-xs leading-5 theme-text-muted">
                            Belum terdapat data langganan sekolah dari sistem.
                          </p>
                          <button
                            type="button"
                            onClick={fetchSubscriptions}
                            className={`mt-4 inline-flex items-center gap-2 rounded-lg ${themePrimaryGradient} px-4 py-2 text-xs font-semibold text-[var(--color-card)] transition ${themePrimaryShadow} hover:brightness-95`}
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

            <div
              className={`flex flex-col gap-3 border-t ${themeDivider} px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6`}
            >
              <div className="flex items-start gap-2 text-xs theme-text-muted">
                <ShieldCheck size={14} className="mt-0.5 shrink-0" />
                <p>
                  Endpoint:
                  <span className="ml-1 font-semibold theme-text-secondary">
                    GET /api/langganan/sekolah
                  </span>
                </p>
              </div>

              <div className="flex items-center justify-between gap-2 sm:justify-end">
                <span className="text-xs theme-text-muted">
                  Halaman {currentPage} dari {totalPages}
                </span>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={goPrev}
                    disabled={currentPage <= 1}
                    className={`inline-flex h-8 w-8 items-center justify-center rounded-lg border ${themeNeutralBorder} ${themeNeutralSurface} theme-text-secondary transition ${themeNeutralHover} disabled:cursor-not-allowed disabled:opacity-40`}
                  >
                    <ChevronLeft size={15} />
                  </button>
                  <button
                    type="button"
                    onClick={goNext}
                    disabled={currentPage >= totalPages}
                    className={`inline-flex h-8 w-8 items-center justify-center rounded-lg border ${themeNeutralBorder} ${themeNeutralSurface} theme-text-secondary transition ${themeNeutralHover} disabled:cursor-not-allowed disabled:opacity-40`}
                  >
                    <ChevronRight size={15} />
                  </button>
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}