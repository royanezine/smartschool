"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  AlertCircle,
  CheckCircle2,
  Clock,
  CreditCard,
  Eye,
  FileText,
  Loader2,
  Receipt,
  RefreshCw,
  Wallet,
  XCircle,
} from "lucide-react";

import Header from "@/app/components/Header";
import Sidebar from "@/app/components/Sidebar";
import { getDetailTagihan } from "@/services/tagihan.service";

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

export default function DetailTagihanPage() {
  const router = useRouter();
  const params = useParams();

  const rawId = params?.id;
  const id = Array.isArray(rawId) ? rawId[0] : rawId;

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [tagihan, setTagihan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadData = useCallback(async () => {
    if (!id) {
      setLoading(false);
      setError("ID tagihan tidak valid.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const result = await getDetailTagihan(id);
      const detail = unwrapItem(result);

      if (!detail) throw new Error("Data tagihan tidak ditemukan.");

      setTagihan(detail);
    } catch (err) {
      console.error("Gagal mengambil detail tagihan:", err);
      setError(err?.message || "Gagal memuat detail tagihan.");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadData();
    }, 0);
    return () => clearTimeout(timer);
  }, [loadData]);

  const canBayar =
    tagihan?.status === "belum_bayar" ||
    tagihan?.status === "sebagian";

  const canBatal =
    tagihan?.status === "belum_bayar" &&
    Number(tagihan?.totalDibayar || 0) === 0;

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
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
                <button
                  type="button"
                  onClick={() => router.push("/admin/keuangan/SPP")}
                  className="inline-flex shrink-0 items-center gap-2 rounded-xl border theme-border theme-card px-4 py-2.5 text-sm font-medium theme-text-secondary transition hover:bg-[color-mix(in_srgb,var(--color-text)_3%,transparent)]"
                >
                  <ArrowLeft size={17} />
                  Kembali
                </button>

                <div className="flex min-w-0 flex-1 items-start gap-3">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[color-mix(in_srgb,var(--color-primary)_10%,transparent)] theme-primary-text">
                    <Eye size={23} />
                  </div>

                  <div className="min-w-0">
                    

                    <h1 className="text-2xl font-bold tracking-tight theme-text">
                      Detail Tagihan
                    </h1>

                    <p className="mt-1 text-sm theme-text-secondary">
                      {tagihan?.nomorTagihan || "-"}
                    </p>
                  </div>
                </div>
              </div>

              {error && (
                <div className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900/60 dark:bg-red-950/30 dark:text-red-300">
                  <AlertCircle size={19} className="mt-0.5 shrink-0" />
                  <p className="flex-1">{error}</p>
                </div>
              )}

              {loading ? (
                <div className="theme-card flex min-h-[300px] flex-col items-center justify-center gap-3 rounded-xl border theme-border">
                  <Loader2
                    size={28}
                    className="animate-spin theme-primary-text"
                  />
                  <p className="text-sm font-medium theme-text">
                    Memuat detail tagihan...
                  </p>
                </div>
              ) : !tagihan ? (
                <div className="theme-card flex min-h-[300px] flex-col items-center justify-center rounded-xl border theme-border p-6 text-center">
                  <AlertCircle size={28} className="text-red-500" />
                  <p className="mt-4 font-semibold theme-text">
                    Tagihan tidak ditemukan
                  </p>
                  <button
                    type="button"
                    onClick={loadData}
                    className="mt-4 inline-flex items-center gap-2 rounded-xl border theme-border theme-card px-4 py-2.5 text-sm font-medium theme-text-secondary"
                  >
                    <RefreshCw size={16} />
                    Muat Ulang
                  </button>
                </div>
              ) : (
                <>
                  {/* RINGKASAN */}
                  <section className="theme-card rounded-2xl border theme-border p-5 shadow-sm sm:p-6">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                      <div className="flex items-start gap-4">
                        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[color-mix(in_srgb,var(--color-primary)_10%,transparent)] theme-primary-text">
                          <Receipt size={24} />
                        </div>

                        <div className="min-w-0">
                          <h2 className="text-lg font-bold theme-text">
                            {tagihan.siswa?.namaLengkap || "-"}
                          </h2>

                          <p className="mt-1 text-sm theme-text-muted">
                            NIS: {tagihan.siswa?.nis || "-"} ·
                            NISN: {tagihan.siswa?.nisn || "-"}
                          </p>
                        </div>
                      </div>

                      <StatusBadge status={tagihan.status} />
                    </div>

                    <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 2xl:grid-cols-6">
                      <RingkasanCard
                        icon={<Wallet size={18} />}
                        label="Total Tagihan"
                        value={formatRupiah(
                          tagihan.totalTagihan
                        )}
                        color="primary"
                      />

                      <RingkasanCard
                        icon={<CheckCircle2 size={18} />}
                        label="Dibayar"
                        value={formatRupiah(
                          tagihan.totalDibayar
                        )}
                        color="success"
                      />

                      <RingkasanCard
                        icon={<AlertCircle size={18} />}
                        label="Sisa"
                        value={formatRupiah(tagihan.sisa)}
                        color="danger"
                      />
                    </div>
                  </section>

                  {/* DETAIL */}
                  <section className="theme-card rounded-2xl border theme-border p-5 shadow-sm sm:p-6">
                    <h2 className="mb-4 text-sm font-bold theme-text">
                      Informasi Tagihan
                    </h2>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 2xl:grid-cols-3">
                      <DetailField
                        label="Nomor Tagihan"
                        value={tagihan.nomorTagihan}
                      />
                      <DetailField
                        label="Kategori"
                        value={tagihan.kategoriTagihan?.nama}
                      />
                      <DetailField
                        label="Periode"
                        value={periodeLabel(tagihan)}
                      />
                      <DetailField
                        label="Tahun Ajaran"
                        value={
                          tagihan.tahunAjaran?.tahunAjaran
                        }
                      />
                      <DetailField
                        label="Nominal"
                        value={formatRupiah(tagihan.nominal)}
                      />
                      <DetailField
                        label="Diskon"
                        value={formatRupiah(tagihan.diskon)}
                      />
                      <DetailField
                        label="Jatuh Tempo"
                        value={formatDate(tagihan.jatuhTempo)}
                      />
                      <DetailField
                        label="Keterangan"
                        value={tagihan.keterangan || "-"}
                      />
                    </div>
                  </section>

                  {/* RIWAYAT PEMBAYARAN */}
                  <section className="theme-card rounded-2xl border theme-border p-5 shadow-sm sm:p-6">
                    <h2 className="mb-4 text-sm font-bold theme-text">
                      Riwayat Pembayaran
                    </h2>

                    {Array.isArray(tagihan.pembayaran) &&
                    tagihan.pembayaran.length > 0 ? (
                      <div className="w-full overflow-x-auto">
                        <table className="w-full min-w-[720px] text-xs">
                          <thead>
                            <tr className="theme-card-soft border-b theme-border">
                              <th className="theme-text-muted px-3 py-2 text-left font-semibold">
                                Nomor
                              </th>
                              <th className="theme-text-muted px-3 py-2 text-left font-semibold">
                                Tanggal
                              </th>
                              <th className="theme-text-muted px-3 py-2 text-left font-semibold">
                                Metode
                              </th>
                              <th className="theme-text-muted px-3 py-2 text-right font-semibold">
                                Jumlah
                              </th>
                              <th className="theme-text-muted px-3 py-2 text-left font-semibold">
                                Status
                              </th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-[var(--color-border-soft)]">
                            {tagihan.pembayaran.map((bayar) => (
                              <tr key={bayar.id}>
                                <td className="theme-text-muted px-3 py-2">
                                  {bayar.nomorPembayaran}
                                </td>
                                <td className="theme-text-secondary px-3 py-2">
                                  {formatDate(
                                    bayar.tanggalBayar
                                  )}
                                </td>
                                <td className="theme-text-secondary px-3 py-2 capitalize">
                                  {bayar.metode}
                                </td>
                                <td className="theme-text px-3 py-2 text-right font-semibold">
                                  {formatRupiah(bayar.jumlah)}
                                </td>
                                <td className="theme-text-secondary px-3 py-2 capitalize">
                                  {bayar.status}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <p className="theme-text-muted text-sm">
                        Belum ada pembayaran tercatat.
                      </p>
                    )}
                  </section>

                  {/* AKSI */}
                  <div className="flex flex-col-reverse gap-3 border-t theme-border pt-5 sm:flex-row sm:justify-end">
                    <button
                      type="button"
                      onClick={() =>
                        router.push("/admin/keuangan/SPP")
                      }
                      className="inline-flex items-center justify-center gap-2 rounded-xl border theme-border theme-card px-4 py-2.5 text-sm font-medium theme-text-secondary transition hover:bg-[color-mix(in_srgb,var(--color-text)_3%,transparent)]"
                    >
                      <ArrowLeft size={16} />
                      Kembali ke Daftar
                    </button>

                    {canBatal && (
                      <button
                        type="button"
                        onClick={() =>
                          router.push(
                            `/admin/keuangan/SPP/${id}/batal`
                          )
                        }
                        className="inline-flex items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm font-semibold text-red-700 transition hover:bg-red-100 dark:border-red-900/60 dark:bg-red-950/30 dark:text-red-300"
                      >
                        <XCircle size={16} />
                        Batalkan Tagihan
                      </button>
                    )}

                    {canBayar && (
                      <button
                        type="button"
                        onClick={() =>
                          router.push(
                            `/admin/keuangan/SPP/${id}/bayar`
                          )
                        }
                        className="inline-flex items-center justify-center gap-2 rounded-xl theme-primary px-4 py-2.5 text-sm font-semibold text-white transition hover:opacity-90"
                      >
                        <CreditCard size={16} />
                        Catat Pembayaran
                      </button>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

function StatusBadge({ status }) {
  const map = {
    lunas: {
      className: "theme-success",
      icon: <CheckCircle2 size={12} />,
      label: "Lunas",
    },
    sebagian: {
      className: "theme-warning",
      icon: <Clock size={12} />,
      label: "Sebagian",
    },
    belum_bayar: {
      className: "theme-warning",
      icon: <Clock size={12} />,
      label: "Belum Bayar",
    },
    batal: {
      className: "theme-danger",
      icon: <XCircle size={12} />,
      label: "Batal",
    },
  };

  const selected =
    map[status] || {
      className: "theme-card-soft theme-text-muted",
      icon: <Clock size={12} />,
      label: status,
    };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${selected.className}`}
    >
      {selected.icon}
      {selected.label}
    </span>
  );
}

function RingkasanCard({ icon, label, value, color }) {
  const colors = {
    primary:
      "bg-[color-mix(in_srgb,var(--color-primary)_10%,transparent)] text-[var(--color-primary)]",
    success: "theme-success",
    danger: "theme-danger",
  };

  return (
    <div className="2xl:col-span-2 rounded-xl border theme-border bg-[color-mix(in_srgb,var(--color-text)_3%,transparent)] p-4">
      <div className="flex items-center gap-2">
        <div
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
            colors[color] || colors.primary
          }`}
        >
          {icon}
        </div>
        <p className="text-xs font-medium theme-text-muted">
          {label}
        </p>
      </div>
      <p className="mt-3 text-lg font-bold theme-text">{value}</p>
    </div>
  );
}

function DetailField({ label, value }) {
  return (
    <div>
      <p className="text-xs font-medium uppercase tracking-wide theme-text-placeholder">
        {label}
      </p>
      <p className="mt-1 text-sm font-semibold theme-text">
        {value || "-"}
      </p>
    </div>
  );
}