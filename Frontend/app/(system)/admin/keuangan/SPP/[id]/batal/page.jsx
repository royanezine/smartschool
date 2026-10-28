"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  AlertCircle,
  CheckCircle2,
  Loader2,
  XCircle,
  X,
} from "lucide-react";

import Header from "@/app/components/Header";
import Sidebar from "@/app/components/Sidebar";
import {
  batalkanTagihan,
  getDetailTagihan,
} from "@/services/tagihan.service";

function unwrapItem(result) {
  if (result?.data?.data) return result.data.data;
  return result?.data ?? result ?? null;
}

function formatRupiah(value) {
  const number = Number(value);
  if (Number.isNaN(number)) return "Rp 0";
  return `Rp ${number.toLocaleString("id-ID")}`;
}

export default function BatalTagihanPage() {
  const router = useRouter();
  const params = useParams();

  const rawId = params?.id;
  const id = Array.isArray(rawId) ? rawId[0] : rawId;

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [tagihan, setTagihan] = useState(null);
  const [alasan, setAlasan] = useState("");

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

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
      console.error("Gagal memuat detail:", err);
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

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!tagihan) return;

    if (!alasan.trim()) {
      setError("Alasan pembatalan wajib diisi.");
      return;
    }

    setSubmitting(true);
    setError("");
    setSuccess("");

    try {
      const result = await batalkanTagihan(
        tagihan.id,
        alasan.trim()
      );

      setSuccess(result?.message || "Tagihan dibatalkan.");

      setTimeout(() => {
        router.push(`/admin/keuangan/SPP/${id}`);
      }, 1200);
    } catch (err) {
      console.error("Gagal membatalkan tagihan:", err);
      setError(err?.message || "Gagal membatalkan tagihan.");
    } finally {
      setSubmitting(false);
    }
  };

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
                  onClick={() =>
                    router.push(`/admin/keuangan/SPP/${id}`)
                  }
                  disabled={submitting}
                  className="inline-flex shrink-0 items-center gap-2 rounded-xl border theme-border theme-card px-4 py-2.5 text-sm font-medium theme-text-secondary transition hover:bg-[color-mix(in_srgb,var(--color-text)_3%,transparent)] disabled:opacity-50"
                >
                  <ArrowLeft size={17} />
                  Kembali
                </button>

                <div className="flex min-w-0 flex-1 items-start gap-3">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-red-50 text-red-700 dark:bg-red-950/50 dark:text-red-300">
                    <XCircle size={23} />
                  </div>

                  <div className="min-w-0">
                   

                    <h1 className="text-2xl font-bold tracking-tight theme-text">
                      Batalkan Tagihan
                    </h1>

                    <p className="mt-1 text-sm theme-text-secondary">
                      Konfirmasi pembatalan tagihan siswa.
                    </p>
                  </div>
                </div>
              </div>

              {error && (
                <div className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900/60 dark:bg-red-950/30 dark:text-red-300">
                  <AlertCircle
                    size={19}
                    className="mt-0.5 shrink-0"
                  />
                  <p className="flex-1">{error}</p>
                  <button
                    type="button"
                    onClick={() => setError("")}
                  >
                    <X size={16} />
                  </button>
                </div>
              )}

              {success && (
                <div className="flex items-start gap-3 rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-950/30 dark:text-emerald-300">
                  <CheckCircle2
                    size={18}
                    className="mt-0.5 shrink-0"
                  />
                  <p className="flex-1">{success}</p>
                </div>
              )}

              {loading ? (
                <div className="theme-card flex min-h-[300px] flex-col items-center justify-center gap-3 rounded-xl border theme-border">
                  <Loader2
                    size={28}
                    className="animate-spin theme-primary-text"
                  />
                  <p className="text-sm font-medium theme-text">
                    Memuat data tagihan...
                  </p>
                </div>
              ) : !tagihan ? (
                <div className="theme-card flex min-h-[300px] flex-col items-center justify-center rounded-xl border theme-border">
                  <AlertCircle size={28} className="text-red-500" />
                  <p className="mt-4 font-semibold theme-text">
                    Tagihan tidak ditemukan
                  </p>
                </div>
              ) : (
                <form
                  onSubmit={handleSubmit}
                  className="theme-card space-y-6 rounded-xl border theme-border p-5 shadow-sm sm:p-6"
                >
                  <div className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800 dark:border-red-900/60 dark:bg-red-950/30 dark:text-red-300">
                    <AlertCircle
                      size={18}
                      className="mt-0.5 shrink-0"
                    />
                    <p>
                      Tagihan yang dibatalkan tidak dapat
                      dikembalikan. Pastikan keputusan sudah benar.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 2xl:grid-cols-4">
                    <InfoItem
                      label="Nomor Tagihan"
                      value={tagihan.nomorTagihan}
                    />
                    <InfoItem
                      label="Siswa"
                      value={tagihan.siswa?.namaLengkap}
                    />
                    <InfoItem
                      label="Total Tagihan"
                      value={formatRupiah(tagihan.totalTagihan)}
                    />
                    <InfoItem
                      label="Dibayar"
                      value={formatRupiah(tagihan.totalDibayar)}
                    />
                  </div>

                  <div>
                    <label className="theme-text-secondary mb-1.5 block text-sm font-medium">
                      Alasan Pembatalan
                      <span className="ml-1 text-red-500">*</span>
                    </label>
                    <textarea
                      rows={4}
                      value={alasan}
                      onChange={(event) =>
                        setAlasan(event.target.value)
                      }
                      placeholder="Masukkan alasan pembatalan"
                      className="theme-input w-full resize-y rounded-xl px-4 py-3 text-sm outline-none transition focus:border-[var(--color-primary)] focus:ring-4 focus:ring-[color-mix(in_srgb,var(--color-primary)_12%,transparent)]"
                      disabled={submitting}
                      required
                    />
                  </div>

                  <div className="flex flex-col-reverse gap-3 border-t theme-border pt-5 sm:flex-row sm:justify-end">
                    <button
                      type="button"
                      onClick={() =>
                        router.push(
                          `/admin/keuangan/SPP/${id}`
                        )
                      }
                      disabled={submitting}
                      className="inline-flex items-center justify-center gap-2 rounded-xl border theme-border theme-card px-4 py-2.5 text-sm font-medium theme-text-secondary transition hover:bg-[color-mix(in_srgb,var(--color-text)_3%,transparent)] disabled:opacity-50"
                    >
                      <ArrowLeft size={16} />
                      Batal
                    </button>

                    <button
                      type="submit"
                      disabled={submitting || !alasan.trim()}
                      className="inline-flex items-center justify-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {submitting ? (
                        <Loader2
                          size={16}
                          className="animate-spin"
                        />
                      ) : (
                        <XCircle size={16} />
                      )}
                      {submitting
                        ? "Memproses..."
                        : "Batalkan Tagihan"}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

function InfoItem({ label, value }) {
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