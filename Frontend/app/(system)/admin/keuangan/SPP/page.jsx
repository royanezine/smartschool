"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Search,
  Plus,
  Eye,
  CheckCircle2,
  XCircle,
  Clock,
  ChevronLeft,
  ChevronRight,
  FileText,
  X,
  Wallet,
  Loader2,
  RefreshCw,
  CreditCard,
  AlertCircle,
  Receipt,
} from "lucide-react";

import Header from "@/app/components/Header";
import Sidebar from "@/app/components/Sidebar";

import {
  getTagihan,
  getRingkasanTagihan,
} from "@/services/tagihan.service";

const ENTRIES_PER_PAGE = 10;

const NAMA_BULAN = [
  "Januari",
  "Februari",
  "Maret",
  "April",
  "Mei",
  "Juni",
  "Juli",
  "Agustus",
  "September",
  "Oktober",
  "November",
  "Desember",
];

const STATUS_OPTIONS = [
  { value: "belum_bayar", label: "Belum Bayar" },
  { value: "sebagian", label: "Sebagian" },
  { value: "lunas", label: "Lunas" },
  { value: "batal", label: "Batal" },
];

function unwrapList(result) {
  if (Array.isArray(result)) return result;
  if (Array.isArray(result?.data)) return result.data;
  if (Array.isArray(result?.data?.data)) return result.data.data;
  return [];
}

function unwrapItem(result) {
  if (result?.data?.data) return result.data.data;
  return result?.data ?? result ?? null;
}

function formatRupiah(value) {
  const number = Number(value);
  if (Number.isNaN(number)) return "Rp 0";
  return `Rp ${number.toLocaleString("id-ID")}`;
}

function formatDate(value) {
  if (!value) return "-";
  try {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "-";
    return new Intl.DateTimeFormat("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }).format(date);
  } catch {
    return "-";
  }
}

function periodeLabel(item) {
  if (item?.periodeBulan && item?.periodeTahun) {
    return `${
      NAMA_BULAN[Number(item.periodeBulan) - 1] ||
      item.periodeBulan
    } ${item.periodeTahun}`;
  }
  if (item?.periodeTahun) return String(item.periodeTahun);
  return "-";
}

function statusLabel(status) {
  const found = STATUS_OPTIONS.find(
    (option) => option.value === status
  );
  return found?.label || status || "-";
}

function isTunggakan(item) {
  if (!item) return false;
  const aktif =
    item.status === "belum_bayar" ||
    item.status === "sebagian";
  if (!aktif) return false;
  if (!item.jatuhTempo) return false;
  return new Date(item.jatuhTempo).getTime() < Date.now();
}

export default function SPPPage() {
  const router = useRouter();

  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [tagihanList, setTagihanList] = useState([]);
  const [meta, setMeta] = useState({
    page: 1,
    limit: ENTRIES_PER_PAGE,
    total: 0,
    totalPages: 1,
  });
  const [ringkasan, setRingkasan] = useState(null);

  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadTagihan = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const [listRes, ringkasRes] = await Promise.allSettled([
        getTagihan({
          page: currentPage,
          limit: ENTRIES_PER_PAGE,
          q: search.trim() || undefined,
          status: filterStatus || undefined,
        }),
        getRingkasanTagihan({}),
      ]);

      if (listRes.status === "fulfilled") {
        setTagihanList(unwrapList(listRes.value));
        setMeta(
          listRes.value?.meta || {
            page: currentPage,
            limit: ENTRIES_PER_PAGE,
            total: 0,
            totalPages: 1,
          }
        );
      } else {
        setTagihanList([]);
        throw listRes.reason;
      }

      if (ringkasRes.status === "fulfilled") {
        setRingkasan(unwrapItem(ringkasRes.value));
      } else {
        setRingkasan(null);
      }
    } catch (err) {
      console.error("Gagal memuat tagihan:", err);
      setError(
        err?.message || "Gagal memuat data tagihan dari server."
      );
    } finally {
      setLoading(false);
    }
  }, [currentPage, search, filterStatus]);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadTagihan();
    }, 0);
    return () => clearTimeout(timer);
  }, [loadTagihan]);

  const totalPages = meta?.totalPages || 1;
  const indexOfFirst = (currentPage - 1) * ENTRIES_PER_PAGE;

  const getStatusBadge = (status, item) => {
    if (isTunggakan(item)) {
      return (
        <span className="theme-danger inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold">
          <AlertCircle size={12} />
          Tunggakan
        </span>
      );
    }

    const map = {
      lunas: {
        className: "theme-success",
        icon: <CheckCircle2 size={12} />,
      },
      sebagian: {
        className: "theme-warning",
        icon: <Clock size={12} />,
      },
      belum_bayar: {
        className: "theme-warning",
        icon: <Clock size={12} />,
      },
      batal: {
        className: "theme-danger",
        icon: <XCircle size={12} />,
      },
    };

    const selected =
      map[status] || {
        className: "theme-card-soft theme-text-muted",
        icon: <Clock size={12} />,
      };

    return (
      <span
        className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${selected.className}`}
      >
        {selected.icon}
        {statusLabel(status)}
      </span>
    );
  };

  const canBayar = (item) =>
    item?.status === "belum_bayar" || item?.status === "sebagian";

  const canBatal = (item) =>
    item?.status === "belum_bayar" &&
    Number(item?.totalDibayar || 0) === 0;

  return (
    <div className="theme-page flex h-screen w-full overflow-hidden">
      <Sidebar
        role="admin"
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
        <div className="shrink-0">
          <Header onMenuClick={() => setSidebarOpen(true)} />
        </div>

        <main className="min-h-0 min-w-0 flex-1 overflow-y-auto theme-page">
          <div className="w-full px-4 py-5 sm:px-6 sm:py-6 lg:px-8 lg:py-8">
            <div className="w-full space-y-6">
              {/* HEADER */}
              <section className="theme-card overflow-hidden rounded-2xl border theme-border shadow-sm">
                <div className="flex flex-col gap-4 p-5 sm:p-6 lg:flex-row lg:items-center lg:justify-between">
                  <div className="flex items-start gap-4">
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-[color-mix(in_srgb,var(--color-primary)_12%,transparent)] text-[var(--color-primary)]">
                      <Wallet size={28} />
                    </div>

                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-[var(--color-primary)]">
                        Keuangan & Kas
                      </p>

                      <h1 className="theme-text text-2xl font-bold tracking-tight sm:text-3xl">
                        SPP & Tagihan
                      </h1>

                      <p className="theme-text-secondary mt-1 text-sm">
                        Kelola tagihan dan pembayaran siswa
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={loadTagihan}
                      disabled={loading}
                      className="theme-card-soft theme-text-secondary inline-flex items-center gap-2 rounded-lg border theme-border px-4 py-2.5 text-sm font-medium transition hover:brightness-95 disabled:opacity-60"
                    >
                      <RefreshCw
                        size={16}
                        className={loading ? "animate-spin" : ""}
                      />
                      Muat Ulang
                    </button>

                    <Link
                      href="/admin/keuangan/laporan"
                      className="theme-card-soft theme-text-secondary inline-flex items-center gap-2 rounded-lg border theme-border px-4 py-2.5 text-sm font-medium transition hover:brightness-95"
                    >
                      <FileText size={16} />
                      Laporan
                    </Link>

                    <button
                      type="button"
                      onClick={() =>
                        router.push("/admin/keuangan/SPP/generate")
                      }
                      className="theme-primary inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium text-white transition hover:brightness-95"
                    >
                      <Plus size={16} />
                      Generate Tagihan
                    </button>
                  </div>
                </div>
              </section>

              {error && (
                <div className="theme-danger flex items-start gap-3 rounded-xl border px-4 py-3 text-sm">
                  <AlertCircle
                    size={18}
                    className="mt-0.5 shrink-0"
                  />
                  <div className="flex-1">
                    <p className="font-semibold">Terjadi masalah</p>
                    <p className="mt-0.5 text-xs opacity-80">
                      {error}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setError("")}
                  >
                    <X size={16} />
                  </button>
                </div>
              )}

              {/* STAT CARDS */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-6">
                <StatCard
                  icon={<Receipt size={22} />}
                  label="Total Tagihan"
                  value={Number(
                    ringkasan?.totalTagihan || 0
                  ).toLocaleString("id-ID", {
                    style: "currency",
                    currency: "IDR",
                    maximumFractionDigits: 0,
                  })}
                  color="primary"
                  subtext={`${ringkasan?.jumlahTagihan || 0} tagihan`}
                />

                <StatCard
                  icon={<CheckCircle2 size={22} />}
                  label="Sudah Dibayar"
                  value={Number(
                    ringkasan?.totalDibayar || 0
                  ).toLocaleString("id-ID", {
                    style: "currency",
                    currency: "IDR",
                    maximumFractionDigits: 0,
                  })}
                  color="success"
                  subtext="Pembayaran diterima"
                />

                <StatCard
                  icon={<Wallet size={22} />}
                  label="Sisa Tagihan"
                  value={Number(
                    ringkasan?.totalSisa || 0
                  ).toLocaleString("id-ID", {
                    style: "currency",
                    currency: "IDR",
                    maximumFractionDigits: 0,
                  })}
                  color="warning"
                  subtext="Belum tertagih lunas"
                />

                <StatCard
                  icon={<AlertCircle size={22} />}
                  label="Tunggakan"
                  value={Number(
                    ringkasan?.totalTunggakan || 0
                  ).toLocaleString("id-ID", {
                    style: "currency",
                    currency: "IDR",
                    maximumFractionDigits: 0,
                  })}
                  color="danger"
                  subtext={`${
                    ringkasan?.jumlahTunggakan || 0
                  } tagihan lewat jatuh tempo`}
                />

                <StatCard
                  icon={<FileText size={22} />}
                  label="Total Baris"
                  value={meta?.total || 0}
                  color="primary"
                  subtext="Hasil filter saat ini"
                />

                <StatCard
                  icon={<Clock size={22} />}
                  label="Halaman"
                  value={`${currentPage} / ${totalPages}`}
                  color="primary"
                  subtext={`${ENTRIES_PER_PAGE} per halaman`}
                />
              </div>

              {/* FILTER */}
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <div className="relative flex-1">
                  <Search
                    size={18}
                    className="theme-text-muted absolute left-3.5 top-1/2 -translate-y-1/2"
                  />

                  <input
                    value={search}
                    onChange={(event) => {
                      setSearch(event.target.value);
                      setCurrentPage(1);
                    }}
                    placeholder="Cari nomor tagihan, nama siswa, atau NIS..."
                    className="theme-input w-full rounded-xl py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-[var(--color-primary)] focus:ring-4 focus:ring-[color-mix(in_srgb,var(--color-primary)_12%,transparent)]"
                  />
                </div>

                <select
                  value={filterStatus}
                  onChange={(event) => {
                    setFilterStatus(event.target.value);
                    setCurrentPage(1);
                  }}
                  className="theme-input rounded-xl px-4 py-2.5 text-sm outline-none transition focus:border-[var(--color-primary)] focus:ring-4 focus:ring-[color-mix(in_srgb,var(--color-primary)_12%,transparent)]"
                >
                  <option value="">Semua Status</option>
                  {STATUS_OPTIONS.map((option) => (
                    <option
                      key={option.value}
                      value={option.value}
                    >
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* TABEL */}
              <div className="theme-card overflow-hidden rounded-2xl border theme-border shadow-sm">
                <div className="w-full overflow-x-auto">
                  <table className="w-full min-w-[1000px] text-sm">
                    <thead>
                      <tr className="theme-card-soft border-b theme-border">
                        {[
                          "No",
                          "Siswa",
                          "Kategori",
                          "Periode",
                          "Total",
                          "Dibayar",
                          "Sisa",
                          "Status",
                          "Jatuh Tempo",
                          "Aksi",
                        ].map((heading, index) => (
                          <th
                            key={heading}
                            className={`theme-text-muted px-4 py-3.5 text-xs font-semibold uppercase tracking-wider ${
                              index >= 4 && index <= 6
                                ? "text-right"
                                : index === 9
                                ? "text-center"
                                : "text-left"
                            }`}
                          >
                            {heading}
                          </th>
                        ))}
                      </tr>
                    </thead>

                    <tbody className="divide-y divide-[var(--color-border-soft)]">
                      {loading ? (
                        <tr>
                          <td
                            colSpan={10}
                            className="theme-text-muted px-4 py-12 text-center"
                          >
                            <div className="flex items-center justify-center gap-2">
                              <Loader2
                                size={18}
                                className="animate-spin text-[var(--color-primary)]"
                              />
                              <span className="text-sm">
                                Memuat data tagihan...
                              </span>
                            </div>
                          </td>
                        </tr>
                      ) : tagihanList.length === 0 ? (
                        <tr>
                          <td
                            colSpan={10}
                            className="theme-text-muted px-4 py-12 text-center"
                          >
                            <div className="flex flex-col items-center gap-2">
                              <FileText
                                size={32}
                                className="opacity-50"
                              />
                              <p className="theme-text-secondary text-sm font-medium">
                                Tidak ada data tagihan
                              </p>
                              <p className="text-xs">
                                Ubah filter atau generate tagihan
                                baru
                              </p>
                            </div>
                          </td>
                        </tr>
                      ) : (
                        tagihanList.map((item, index) => (
                          <tr
                            key={item.id}
                            className="theme-text-secondary transition hover:bg-[color-mix(in_srgb,var(--color-primary)_4%,var(--color-card))]"
                          >
                            <td className="theme-text-muted px-4 py-3.5 text-sm">
                              {indexOfFirst + index + 1}
                            </td>

                            <td className="px-4 py-3.5">
                              <p className="theme-text font-medium">
                                {item.siswa?.namaLengkap || "-"}
                              </p>
                              <p className="theme-text-muted text-xs">
                                {item.siswa?.nis
                                  ? `NIS ${item.siswa.nis}`
                                  : item.nomorTagihan}
                              </p>
                            </td>

                            <td className="px-4 py-3.5">
                              {item.kategoriTagihan?.nama || "-"}
                            </td>

                            <td className="px-4 py-3.5">
                              {periodeLabel(item)}
                            </td>

                            <td className="theme-text px-4 py-3.5 text-right font-semibold">
                              {formatRupiah(item.totalTagihan)}
                            </td>

                            <td className="px-4 py-3.5 text-right">
                              {formatRupiah(item.totalDibayar)}
                            </td>

                            <td className="theme-text px-4 py-3.5 text-right font-bold">
                              {formatRupiah(item.sisa)}
                            </td>

                            <td className="px-4 py-3.5">
                              {getStatusBadge(
                                item.status,
                                item
                              )}
                            </td>

                            <td className="px-4 py-3.5">
                              {formatDate(item.jatuhTempo)}
                            </td>

                            <td className="px-4 py-3.5">
                              <div className="flex items-center justify-center gap-1">
                                <ActionButton
                                  title="Lihat detail"
                                  icon={<Eye size={16} />}
                                  onClick={() =>
                                    router.push(
                                      `/admin/keuangan/SPP/${item.id}`
                                    )
                                  }
                                  type="primary"
                                />

                                {canBayar(item) && (
                                  <ActionButton
                                    title="Catat pembayaran"
                                    icon={
                                      <CreditCard size={16} />
                                    }
                                    onClick={() =>
                                      router.push(
                                        `/admin/keuangan/SPP/${item.id}/bayar`
                                      )
                                    }
                                    type="primary"
                                  />
                                )}

                                {canBatal(item) && (
                                  <ActionButton
                                    title="Batalkan tagihan"
                                    icon={<XCircle size={16} />}
                                    onClick={() =>
                                      router.push(
                                        `/admin/keuangan/SPP/${item.id}/batal`
                                      )
                                    }
                                    type="danger"
                                  />
                                )}
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                {!loading && tagihanList.length > 0 && (
                  <div className="theme-card-soft flex flex-col items-start justify-between gap-3 border-t theme-border px-4 py-3 sm:flex-row sm:items-center">
                    <p className="theme-text-muted text-sm">
                      Menampilkan {indexOfFirst + 1}-
                      {Math.min(
                        indexOfFirst + ENTRIES_PER_PAGE,
                        meta?.total || 0
                      )}{" "}
                      dari {meta?.total || 0} data
                    </p>

                    <div className="flex items-center gap-1">
                      <PaginationButton
                        disabled={currentPage === 1}
                        onClick={() =>
                          setCurrentPage((page) =>
                            Math.max(1, page - 1)
                          )
                        }
                      >
                        <ChevronLeft size={16} />
                      </PaginationButton>

                      {Array.from(
                        { length: totalPages },
                        (_, i) => (
                          <button
                            key={i}
                            type="button"
                            onClick={() =>
                              setCurrentPage(i + 1)
                            }
                            className={
                              currentPage === i + 1
                                ? "theme-primary rounded-lg px-3.5 py-1.5 text-sm font-medium text-white"
                                : "theme-text-secondary rounded-lg px-3.5 py-1.5 text-sm font-medium transition hover:bg-[color-mix(in_srgb,var(--color-primary)_8%,transparent)]"
                            }
                          >
                            {i + 1}
                          </button>
                        )
                      )}

                      <PaginationButton
                        disabled={currentPage >= totalPages}
                        onClick={() =>
                          setCurrentPage((page) =>
                            Math.min(totalPages, page + 1)
                          )
                        }
                      >
                        <ChevronRight size={16} />
                      </PaginationButton>
                    </div>
                  </div>
                )}
              </div>

              <footer className="theme-text-muted border-t theme-border-soft pt-6 text-center text-xs">
                © 2026 SmartSchool • SPP & Tagihan
              </footer>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

/* ---------- sub-komponen ---------- */

function StatCard({ icon, label, value, color, subtext }) {
  const colors = {
    primary:
      "bg-[color-mix(in_srgb,var(--color-primary)_10%,transparent)] text-[var(--color-primary)]",
    success: "theme-success",
    warning: "theme-warning",
    danger: "theme-danger",
  };

  return (
    <div className="theme-card group rounded-2xl border theme-border p-5 shadow-sm transition hover:shadow-md">
      <div className="flex items-start gap-4">
        <div
          className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${
            colors[color] || colors.primary
          } transition group-hover:scale-105`}
        >
          {icon}
        </div>

        <div className="min-w-0 flex-1">
          <p className="theme-text-muted text-xs font-medium">
            {label}
          </p>
          <p className="theme-text mt-1 text-lg font-bold">
            {value}
          </p>
          {subtext && (
            <p className="theme-text-muted mt-0.5 text-xs">
              {subtext}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

function ActionButton({ title, icon, onClick, type = "primary" }) {
  const styles =
    type === "danger"
      ? "hover:bg-[color-mix(in_srgb,var(--color-danger)_10%,transparent)] hover:text-[var(--color-danger)]"
      : "hover:bg-[color-mix(in_srgb,var(--color-primary)_10%,transparent)] hover:text-[var(--color-primary)]";

  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      className={`theme-text-muted rounded-lg p-1.5 transition ${styles}`}
    >
      {icon}
    </button>
  );
}

function PaginationButton({ children, disabled, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="theme-card theme-text-muted rounded-lg border theme-border p-2 transition hover:bg-[color-mix(in_srgb,var(--color-primary)_7%,var(--color-card))] disabled:cursor-not-allowed disabled:opacity-40"
    >
      {children}
    </button>
  );
}