"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Wallet,
  History,
  Loader2,
  AlertCircle,
  ArrowDownCircle,
  ArrowUpCircle,
  Plus,
  Minus,
  User,
  CreditCard,
} from "lucide-react";

import Sidebar from "@/app/components/Sidebar";
import Header from "@/app/components/Header";
import {
  getDetailTabungan,
  getMutasiTabungan,
} from "@/services/tabungan.service";

const EMPTY_META = {
  page: 1,
  limit: 10,
  total: 0,
  totalPages: 1,
};

function formatRupiah(value) {
  const amount = Number(value ?? 0);
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(Number.isFinite(amount) ? amount : 0);
}

function formatTanggal(value) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

function getErrorMessage(error) {
  return error instanceof Error
    ? error.message
    : "Terjadi kesalahan. Silakan coba kembali.";
}

const buttonSecondary =
  "inline-flex items-center justify-center gap-2 rounded-lg border theme-border theme-card px-4 py-2.5 text-sm font-medium theme-text-secondary hover:bg-[color-mix(in_srgb,var(--color-text)_3%,transparent)] transition";

export default function DetailTabunganPage() {
  const params = useParams();
  const router = useRouter();
  const siswaId = params?.siswaId;

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [detail, setDetail] = useState(null);
  const [mutasi, setMutasi] = useState([]);
  const [mutasiMeta, setMutasiMeta] = useState(EMPTY_META);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadDetail = useCallback(async () => {
    if (!siswaId) {
      setLoading(false);
      setError("ID siswa tidak ditemukan pada URL.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const [detailResponse, mutasiResponse] = await Promise.all([
        getDetailTabungan(siswaId),
        getMutasiTabungan(siswaId, { page: 1, limit: 10 }),
      ]);

      setDetail(detailResponse);
      setMutasi(
        Array.isArray(mutasiResponse?.data) ? mutasiResponse.data : []
      );
      setMutasiMeta(mutasiResponse?.meta || EMPTY_META);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [siswaId]);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadDetail();
    }, 0);
    return () => clearTimeout(timer);
  }, [loadDetail]);

  function handleBack() {
    router.push("/admin/keuangan/tabunganSiswa");
  }

  function openSetor() {
    router.push(
      `/admin/keuangan/tabunganSiswa/setor?siswaId=${encodeURIComponent(
        siswaId
      )}`
    );
  }

  function openTarik() {
    router.push(
      `/admin/keuangan/tabunganSiswa/tarik?siswaId=${encodeURIComponent(
        siswaId
      )}`
    );
  }

  return (
    <div className="theme-page flex h-screen w-full overflow-hidden">
      <Sidebar
        role="admin"
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <div className="shrink-0">
          <Header onMenuClick={() => setSidebarOpen(true)} />
        </div>

        <main className="min-h-0 min-w-0 flex-1 overflow-y-auto theme-page theme-text">
          <div className="w-full px-4 py-5 sm:px-6 sm:py-6 lg:px-8 lg:py-8">
            <div className="mx-auto w-full max-w-5xl space-y-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex items-start gap-3">
                  <button
                    type="button"
                    onClick={handleBack}
                    className="mt-1 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border theme-border theme-card theme-text-secondary hover:bg-[color-mix(in_srgb,var(--color-text)_3%,transparent)] transition"
                    aria-label="Kembali"
                  >
                    <ArrowLeft size={17} />
                  </button>

                  <div>
                   
                    <h1 className="mt-1 text-2xl font-bold theme-text">
                      Detail Tabungan Siswa
                    </h1>
                    <p className="mt-1 max-w-2xl text-sm leading-6 theme-text-secondary">
                      Informasi saldo dan riwayat mutasi tabungan.
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  
                  <button
                    type="button"
                    onClick={openSetor}
                    className="inline-flex items-center justify-center gap-2 rounded-lg theme-primary px-4 py-2.5 text-sm font-semibold text-white hover:opacity-90 transition"
                  >
                    <Plus size={16} />
                    Setor
                  </button>
                  <button
                    type="button"
                    onClick={openTarik}
                    className="inline-flex items-center justify-center gap-2 rounded-lg bg-amber-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-amber-700 transition"
                  >
                    <Minus size={16} />
                    Tarik
                  </button>
                </div>
              </div>

              {error && (
                <div
                  role="alert"
                  className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900/60 dark:bg-red-950/30 dark:text-red-300"
                >
                  <AlertCircle size={19} className="mt-0.5 shrink-0" />
                  <p className="flex-1 break-words">{error}</p>
                </div>
              )}

              {loading ? (
                <div className="flex min-h-[300px] flex-col items-center justify-center gap-3 theme-card rounded-xl border theme-border">
                  <Loader2
                    size={28}
                    className="animate-spin theme-primary-text"
                  />
                  <p className="text-sm font-medium theme-text">
                    Memuat detail tabungan...
                  </p>
                  <p className="text-xs theme-text-muted">
                    Mengambil data dari sistem
                  </p>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                    <div className="theme-card rounded-xl border theme-border p-4">
                      <div className="flex items-center gap-2">
                        <User size={15} className="theme-primary-text" />
                        <p className="text-[10px] font-semibold uppercase tracking-wide theme-text-muted">
                          Nama siswa
                        </p>
                      </div>
                      <p className="mt-2 text-sm font-semibold theme-text">
                        {detail?.siswa?.namaLengkap || "-"}
                      </p>
                    </div>

                    <div className="theme-card rounded-xl border theme-border p-4">
                      <div className="flex items-center gap-2">
                        <CreditCard
                          size={15}
                          className="theme-primary-text"
                        />
                        <p className="text-[10px] font-semibold uppercase tracking-wide theme-text-muted">
                          NIS
                        </p>
                      </div>
                      <p className="mt-2 text-sm font-semibold theme-text">
                        {detail?.siswa?.nis || "-"}
                      </p>
                    </div>

                    <div className="theme-card rounded-xl border theme-border p-4">
                      <div className="flex items-center gap-2">
                        <Wallet size={15} className="theme-primary-text" />
                        <p className="text-[10px] font-semibold uppercase tracking-wide theme-text-muted">
                          Saldo tabungan
                        </p>
                      </div>
                      <p className="mt-2 whitespace-nowrap text-lg font-bold tabular-nums theme-text">
                        {formatRupiah(detail?.saldo ?? 0)}
                      </p>
                    </div>
                  </div>

                  <div className="theme-card overflow-hidden rounded-xl border theme-border shadow-sm">
                    <div className="border-b theme-border p-5">
                      <div className="flex items-center gap-2">
                        <History size={18} className="theme-text-muted" />
                        <h2 className="text-sm font-bold theme-text">
                          Riwayat Mutasi
                        </h2>
                      </div>
                      <p className="mt-1 text-xs theme-text-muted">
                        Semua transaksi setoran dan penarikan tabungan siswa.
                      </p>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full min-w-[650px] text-left text-sm">
                        <thead className="bg-[color-mix(in_srgb,var(--color-text)_3%,transparent)] text-xs uppercase tracking-wide theme-text-muted border-b theme-border">
                          <tr>
                            <th className="px-4 py-3 font-semibold">
                              Tanggal
                            </th>
                            <th className="px-4 py-3 font-semibold">
                              Nomor Transaksi
                            </th>
                            <th className="px-4 py-3 font-semibold">Jenis</th>
                            <th className="px-4 py-3 text-right font-semibold">
                              Jumlah
                            </th>
                            <th className="px-4 py-3 text-right font-semibold">
                              Saldo Sesudah
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[color-mix(in_srgb,var(--color-text)_5%,transparent)]">
                          {mutasi.length === 0 ? (
                            <tr>
                              <td
                                colSpan={5}
                                className="px-4 py-10 text-center"
                              >
                                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-[color-mix(in_srgb,var(--color-text)_5%,transparent)] theme-text-muted">
                                  <History size={22} />
                                </div>
                                <p className="mt-3 text-sm font-bold theme-text">
                                  Belum ada mutasi tabungan
                                </p>
                                <p className="mt-1 text-xs theme-text-muted">
                                  Mutasi akan muncul setelah ada setoran atau
                                  penarikan.
                                </p>
                              </td>
                            </tr>
                          ) : (
                            mutasi.map((item) => {
                              const isSetor = item.jenis === "setor";
                              return (
                                <tr
                                  key={item.id}
                                  className="hover:bg-[color-mix(in_srgb,var(--color-text)_2%,transparent)] transition"
                                >
                                  <td className="px-4 py-3 text-xs theme-text-secondary">
                                    {formatTanggal(item.tanggal)}
                                  </td>
                                  <td className="px-4 py-3 text-xs font-semibold theme-text">
                                    {item.nomorTransaksi || "-"}
                                  </td>
                                  <td className="px-4 py-3">
                                    <span
                                      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                                        isSetor
                                          ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300"
                                          : "bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300"
                                      }`}
                                    >
                                      {isSetor ? (
                                        <ArrowDownCircle size={12} />
                                      ) : (
                                        <ArrowUpCircle size={12} />
                                      )}
                                      {isSetor ? "Setoran" : "Penarikan"}
                                    </span>
                                  </td>
                                  <td
                                    className={`px-4 py-3 text-right text-xs font-bold tabular-nums whitespace-nowrap ${
                                      isSetor
                                        ? "text-emerald-700 dark:text-emerald-400"
                                        : "text-amber-700 dark:text-amber-400"
                                    }`}
                                  >
                                    {isSetor ? "+" : "-"}
                                    {formatRupiah(item.jumlah)}
                                  </td>
                                  <td className="px-4 py-3 text-right text-xs font-semibold tabular-nums whitespace-nowrap theme-text">
                                    {formatRupiah(item.saldoSesudah)}
                                  </td>
                                </tr>
                              );
                            })
                          )}
                        </tbody>
                      </table>
                    </div>

                    <div className="flex justify-between border-t theme-border px-5 py-3 text-[11px] theme-text-muted">
                      <span>
                        Total {mutasiMeta?.total || mutasi.length} mutasi
                      </span>
                      <span>
                        Halaman {mutasiMeta?.page || 1} dari{" "}
                        {mutasiMeta?.totalPages || 1}
                      </span>
                    </div>
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