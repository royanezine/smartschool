"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  AlertCircle,
  CheckCircle2,
  Calendar,
  Clock3,
  DollarSign,
  FileText,
  Loader2,
  RefreshCw,
  User,
  Users,
  Wallet,
  Ban,
} from "lucide-react";

import Header from "@/app/components/Header";
import Sidebar from "@/app/components/Sidebar";
import {
  getTunggakan,
  batalkanTagihan,
} from "@/services/tagihan.service";

function formatRupiah(value) {
  const number = Number(value ?? 0);
  if (Number.isNaN(number)) return "Rp 0";

  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(number);
}

function formatTanggal(value) {
  if (!value) return "-";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";

  return date.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

function StatusBadge({ status }) {
  const s = String(status).toLowerCase();

  if (s === "lunas") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full theme-success bg-[color-mix(in_srgb,var(--color-success)_10%,transparent)] px-3 py-1 text-xs font-semibold">
        <CheckCircle2 size={12} />
        Lunas
      </span>
    );
  }

  if (s === "sebagian") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full theme-info bg-[color-mix(in_srgb,var(--color-info)_10%,transparent)] px-3 py-1 text-xs font-semibold">
        Sebagian
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1 rounded-full theme-danger bg-[color-mix(in_srgb,var(--color-danger)_10%,transparent)] px-3 py-1 text-xs font-semibold">
      <AlertCircle size={12} />
      Menunggak
    </span>
  );
}

export default function DetailTunggakanPage() {
  const router = useRouter();
  const params = useParams();

  const rawId = params?.id;
  const id = Array.isArray(rawId) ? rawId[0] : rawId;

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [cancelling, setCancelling] = useState(false);

  const loadData = useCallback(async () => {
    if (!id) {
      setLoading(false);
      setError("ID tagihan tidak ditemukan pada URL.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await getTunggakan({
        page: 1,
        limit: 500,
      });

      const list = Array.isArray(response?.data)
        ? response.data
        : [];

      const found = list.find(
        (row) => String(row.id) === String(id)
      );

      if (!found) {
        throw new Error(
          "Data tagihan tidak ditemukan. Mungkin sudah dibatalkan."
        );
      }

      setItem(found);
    } catch (err) {
      console.error(
        "[DetailTunggakan] Gagal mengambil data:",
        err
      );
      setError(
        err?.message || "Gagal memuat detail tagihan."
      );
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

  const handleBatal = async () => {
    if (!item) return;

    const namaTagihan =
      item.kategoriTagihan?.nama ||
      `Tagihan #${item.kode || item.id}`;

    const alasan = window.prompt(
      `Masukkan alasan pembatalan tagihan ${namaTagihan}:`
    );

    if (!alasan || !alasan.trim()) return;

    try {
      setCancelling(true);
      await batalkanTagihan(item.id, alasan.trim());
      router.push("/admin/keuangan/tunggakan");
    } catch (err) {
      console.error("Gagal membatalkan tagihan:", err);
      alert(err?.message || "Gagal membatalkan tagihan.");
    } finally {
      setCancelling(false);
    }
  };

  const siswa = item?.siswa;
  const kategori = item?.kategoriTagihan;

  const namaSiswa = siswa?.nama || "-";
  const nisn = siswa?.nisn || siswa?.nis || "-";
  const kelas = siswa?.kelas?.nama || "-";

  const namaTagihan =
    kategori?.nama ||
    `Tagihan #${item?.kode || item?.id || "-"}`;

  const nominal = Number(item?.jumlah) || 0;
  const terbayar = Number(item?.terbayar) || 0;
  const sisa = Number(item?.sisa) || 0;

  const status =
    item?.status === "lunas"
      ? "Lunas"
      : item?.status === "sebagian"
      ? "Sebagian"
      : "Menunggak";

  const isLunas = String(status).toLowerCase() === "lunas";

  return (
    <div className="flex h-screen w-full overflow-hidden theme-page">
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
              {/* HEADER + KEMBALI DI KIRI ATAS */}
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
                

                <div className="flex min-w-0 flex-1 items-start gap-3">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[color-mix(in_srgb,var(--color-primary)_10%,transparent)] theme-primary-text">
                    <FileText size={23} />
                  </div>

                  <div className="min-w-0">
                   

                    <h1 className="text-2xl font-bold tracking-tight theme-text">
                      Detail Tagihan
                    </h1>

                    <p className="mt-1 text-sm theme-text-secondary">
                      Informasi lengkap tagihan dan status pembayaran
                      siswa.
                    </p>
                  </div>
                </div>
              </div>

              {error && (
                <div
                  role="alert"
                  className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900/60 dark:bg-red-950/30 dark:text-red-300"
                >
                  <AlertCircle
                    size={19}
                    className="mt-0.5 shrink-0"
                  />

                  <div className="min-w-0 flex-1">
                    <p className="font-semibold">
                      Gagal memuat data
                    </p>
                    <p className="mt-1 break-words">{error}</p>
                  </div>
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
              ) : !item ? (
                <div className="theme-card flex min-h-[300px] flex-col items-center justify-center rounded-xl border theme-border p-6 text-center">
                  <AlertCircle
                    size={28}
                    className="text-red-500"
                  />

                  <p className="mt-4 font-semibold theme-text">
                    Tagihan tidak ditemukan
                  </p>

                  <p className="mt-1 max-w-sm text-sm theme-text-muted">
                    Data tagihan mungkin sudah dihapus atau
                    dibatalkan.
                  </p>

                  <button
                    type="button"
                    onClick={loadData}
                    className="mt-4 inline-flex items-center gap-2 rounded-xl border theme-border theme-card px-4 py-2.5 text-sm font-medium theme-text-secondary transition hover:bg-[color-mix(in_srgb,var(--color-text)_3%,transparent)]"
                  >
                    <RefreshCw size={16} />
                    Muat Ulang
                  </button>
                </div>
              ) : (
                <>
                  {/* RINGKASAN SISWA & TAGIHAN */}
                  <section className="theme-card overflow-hidden rounded-xl border theme-border shadow-sm">
                    <div className="flex flex-col gap-4 border-b theme-border p-5 sm:flex-row sm:items-start sm:justify-between sm:p-6">
                      <div className="flex items-start gap-4">
                        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[color-mix(in_srgb,var(--color-primary)_10%,transparent)] theme-primary-text">
                          <User size={24} />
                        </div>

                        <div className="min-w-0">
                          <h2 className="text-lg font-bold theme-text">
                            {namaSiswa}
                          </h2>

                          <p className="mt-1 flex flex-wrap items-center gap-2 text-sm theme-text-muted">
                            <span className="inline-flex items-center gap-1">
                              <Users size={14} />
                              Kelas: {kelas}
                            </span>

                            <span className="inline-flex items-center gap-1">
                              NISN/NIS: {nisn}
                            </span>
                          </p>
                        </div>
                      </div>

                      <StatusBadge status={status} />
                    </div>

                    {/* Nominal ringkas */}
                    <div className="grid grid-cols-1 gap-4 p-5 sm:grid-cols-3 sm:p-6">
                      <RingkasanCard
                        icon={<DollarSign size={18} />}
                        label="Jumlah Tagihan"
                        value={formatRupiah(nominal)}
                        color="blue"
                      />

                      <RingkasanCard
                        icon={<Wallet size={18} />}
                        label="Sudah Terbayar"
                        value={formatRupiah(terbayar)}
                        color="emerald"
                      />

                      <RingkasanCard
                        icon={<AlertCircle size={18} />}
                        label="Sisa Tunggakan"
                        value={formatRupiah(sisa)}
                        color="red"
                      />
                    </div>
                  </section>

                  {/* DETAIL INFORMASI */}
                  <section className="theme-card overflow-hidden rounded-xl border theme-border shadow-sm">
                    <div className="flex items-start gap-3 border-b theme-border p-5 sm:p-6">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[color-mix(in_srgb,var(--color-primary)_10%,transparent)] theme-primary-text">
                        <FileText size={19} />
                      </div>

                      <div>
                        <h2 className="font-semibold theme-text">
                          Informasi Tagihan
                        </h2>
                        <p className="mt-1 text-sm theme-text-muted">
                          Detail kategori, tanggal, dan status
                          tagihan.
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4 p-5 sm:grid-cols-2 sm:p-6">
                      <DetailField
                        label="Nama Tagihan"
                        value={namaTagihan}
                      />

                      <DetailField
                        label="Kategori"
                        value={
                          kategori?.nama || "Tagihan"
                        }
                      />

                      <DetailField
                        label="Kode Tagihan"
                        value={item?.kode || item?.id || "-"}
                      />

                      <DetailField
                        label="Status"
                        value={status}
                      />

                      <DetailField
                        label="Jatuh Tempo"
                        value={formatTanggal(
                          item?.jatuhTempo
                        )}
                        icon={<Calendar size={14} />}
                      />

                      <DetailField
                        label="Hari Terlambat"
                        value={
                          item?.hariTerlambat
                            ? `${item.hariTerlambat} hari`
                            : "-"
                        }
                        icon={<Clock3 size={14} />}
                      />

                      <DetailField
                        label="Tanggal Dibuat"
                        value={formatTanggal(item?.createdAt)}
                      />

                      <DetailField
                        label="Terakhir Diperbarui"
                        value={formatTanggal(
                          item?.updatedAt
                        )}
                      />
                    </div>
                  </section>

                  {/* AKSI */}
                  <div className="flex flex-col-reverse gap-3 border-t theme-border pt-5 sm:flex-row sm:justify-end">
                    <button
                      type="button"
                      onClick={() =>
                        router.push(
                          "/admin/keuangan/tunggakan"
                        )
                      }
                      className="inline-flex items-center justify-center gap-2 rounded-xl border theme-border theme-card px-4 py-2.5 text-sm font-medium theme-text-secondary transition hover:bg-[color-mix(in_srgb,var(--color-text)_3%,transparent)]"
                    >
                      <ArrowLeft size={16} />
                      Kembali ke Daftar
                    </button>

                    {!isLunas && (
                      <button
                        type="button"
                        onClick={handleBatal}
                        disabled={cancelling}
                        className="inline-flex items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm font-semibold text-red-700 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60 dark:border-red-900/60 dark:bg-red-950/30 dark:text-red-300"
                      >
                        {cancelling ? (
                          <Loader2
                            size={16}
                            className="animate-spin"
                          />
                        ) : (
                          <Ban size={16} />
                        )}
                        {cancelling
                          ? "Membatalkan..."
                          : "Batalkan Tagihan"}
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() =>
                        router.push("/admin/keuangan/SPP")
                      }
                      className="inline-flex items-center justify-center gap-2 rounded-xl theme-primary px-4 py-2.5 text-sm font-semibold text-white transition hover:opacity-90"
                    >
                      <DollarSign size={16} />
                      Kelola & Bayar di SPP
                    </button>
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

/* ---------- sub-komponen ---------- */

function RingkasanCard({ icon, label, value, color }) {
  const colors = {
    blue: "bg-[color-mix(in_srgb,var(--color-primary)_10%,transparent)] text-[var(--color-primary)]",
    emerald:
      "bg-[color-mix(in_srgb,var(--color-success)_10%,transparent)] text-[var(--color-success)]",
    red: "bg-[color-mix(in_srgb,var(--color-danger)_10%,transparent)] text-[var(--color-danger)]",
  };

  return (
    <div className="rounded-xl border theme-border bg-[color-mix(in_srgb,var(--color-text)_3%,transparent)] p-4">
      <div className="flex items-center gap-2">
        <div
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${colors[color]}`}
        >
          {icon}
        </div>

        <p className="text-xs font-medium theme-text-muted">
          {label}
        </p>
      </div>

      <p className="mt-3 text-lg font-bold theme-text">
        {value}
      </p>
    </div>
  );
}

function DetailField({ label, value, icon }) {
  return (
    <div>
      <p className="text-xs font-medium uppercase tracking-wide theme-text-placeholder">
        {label}
      </p>

      <p className="mt-1 flex items-center gap-1.5 text-sm font-semibold theme-text">
        {icon}
        {value || "-"}
      </p>
    </div>
  );
}