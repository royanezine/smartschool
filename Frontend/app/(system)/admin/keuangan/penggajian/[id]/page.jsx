"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

import Header from "@/app/components/Header";
import Sidebar from "@/app/components/Sidebar";

import {
  getPenggajianById,
  freezePenggajian,
} from "@/services/penggajian.service";

import {
  ArrowLeft,
  UserRound,
  CalendarDays,
  Clock3,
  Wallet,
  BriefcaseBusiness,
  FileText,
  RefreshCw,
  LoaderCircle,
  AlertCircle,
  CheckCircle2,
  LockKeyhole,
  X,
  Timer,
  Info,
} from "lucide-react";

const MONTHS = [
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

const buttonSecondary =
  "inline-flex h-10 items-center justify-center gap-2 rounded-lg border theme-border theme-card px-3 text-sm font-medium theme-text-secondary hover:bg-[color-mix(in_srgb,var(--color-text)_3%,transparent)] disabled:cursor-not-allowed disabled:opacity-60 transition";

const buttonPrimary =
  "inline-flex h-10 items-center justify-center gap-2 rounded-lg theme-primary px-4 text-sm font-semibold text-white hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60 transition";

function formatCurrency(value) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(Number(value ?? 0));
}

function formatNumber(value, digits = 2) {
  return new Intl.NumberFormat("id-ID", {
    maximumFractionDigits: digits,
  }).format(Number(value ?? 0));
}

function formatDate(value) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";

  return date.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

function formatTime(value) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";

  return date.toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

function getErrorMessage(error) {
  return error instanceof Error
    ? error.message
    : "Terjadi kesalahan saat memproses permintaan.";
}

function getStatusStyle(status) {
  switch (String(status ?? "").toLowerCase()) {
    case "disetujui":
      return "bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300";
    case "dibekukan":
      return "bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300";
    case "dibayar":
      return "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300";
    default:
      return "bg-[color-mix(in_srgb,var(--color-text)_6%,transparent)] theme-text-secondary";
  }
}

function getStatusLabel(status) {
  const labels = {
    draft: "Draft",
    disetujui: "Disetujui",
    dibekukan: "Dibekukan",
    dibayar: "Dibayar",
  };

  return labels[String(status ?? "").toLowerCase()] ?? status ?? "-";
}

function getNestedData(response) {
  return response?.data ?? response;
}

export default function DetailPenggajianPage() {
  const router = useRouter();
  const params = useParams();

  const id = Array.isArray(params?.id) ? params.id[0] : params?.id;

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [freezing, setFreezing] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const loadDetail = useCallback(
    async (isRefresh = false) => {
      if (!id) return;

      if (isRefresh) setRefreshing(true);
      else setLoading(true);

      setError("");

      try {
        const response = await getPenggajianById(id);
        const detail = getNestedData(response);

        if (!detail || !detail.id) {
          throw new Error("Data detail penggajian tidak ditemukan.");
        }

        setData(detail);
      } catch (err) {
        setData(null);
        setError(getErrorMessage(err));
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [id]
  );

  useEffect(() => {
    const timer = setTimeout(() => {
      loadDetail();
    }, 0);
    return () => clearTimeout(timer);
  }, [loadDetail]);

  async function handleFreeze() {
    if (!data?.id || freezing) return;

    const status = String(data.status ?? "").toLowerCase();

    if (status === "dibekukan" || status === "disetujui") {
      setError("Data penggajian ini sudah dibekukan atau disetujui.");
      return;
    }

    const confirmed = window.confirm(
      `Bekukan penggajian ${data.pengguna?.namaLengkap ?? "pegawai"} untuk periode ${
        MONTHS[Number(data.bulan) - 1] ?? data.bulan
      } ${data.tahun}?`
    );

    if (!confirmed) return;

    setFreezing(true);
    setError("");
    setNotice("");

    try {
      const response = await freezePenggajian(data.id);

      setNotice(response?.message ?? "Data penggajian berhasil dibekukan.");
      await loadDetail(true);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setFreezing(false);
    }
  }

  const attendance = Array.isArray(data?.rincianAbsensi)
    ? data.rincianAbsensi
    : [];

  const canFreeze = data
    ? !["dibekukan", "disetujui"].includes(
        String(data.status ?? "").toLowerCase()
      )
    : false;

  return (
    <div className="theme-page flex h-screen w-full overflow-hidden">
      <Sidebar
        role="admin"
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="flex h-screen min-w-0 flex-1 flex-col overflow-hidden">
        <div className="shrink-0">
          <Header onMenuClick={() => setSidebarOpen(true)} />
        </div>

        <main className="theme-page theme-text min-h-0 min-w-0 flex-1 overflow-y-auto overflow-x-hidden">
          <div className="w-full px-4 py-5 sm:px-6 sm:py-6 lg:px-8 lg:py-8">
            <div className="w-full">
              <div className="mb-6">
                <button
                  type="button"
                  onClick={() => router.push("/admin/keuangan/penggajian")}
                  className={`${buttonSecondary} mb-5`}
                >
                  <ArrowLeft size={16} />
                  Kembali ke Penggajian
                </button>

                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <h1 className="theme-text text-2xl font-bold tracking-tight sm:text-3xl">
                      Detail Penggajian
                    </h1>

                    <p className="theme-text-secondary mt-2 max-w-2xl text-sm leading-6">
                      Informasi hasil perhitungan gaji dan rincian absensi
                      berdasarkan data dari sistem.
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => loadDetail(true)}
                      disabled={refreshing || loading}
                      className={buttonSecondary}
                    >
                      <RefreshCw
                        size={16}
                        className={refreshing ? "animate-spin" : ""}
                      />
                      Refresh
                    </button>

                    {canFreeze && (
                      <button
                        type="button"
                        onClick={handleFreeze}
                        disabled={freezing || loading || !data}
                        className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-amber-600 px-4 text-sm font-semibold text-white transition hover:bg-amber-700 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {freezing ? (
                          <LoaderCircle size={16} className="animate-spin" />
                        ) : (
                          <LockKeyhole size={16} />
                        )}
                        {freezing ? "Memproses..." : "Bekukan Gaji"}
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {error && (
                <AlertBox
                  type="error"
                  message={error}
                  onClose={() => setError("")}
                />
              )}

              {notice && (
                <AlertBox
                  type="success"
                  message={notice}
                  onClose={() => setNotice("")}
                />
              )}

              {loading ? (
                <div className="theme-card theme-border flex min-h-80 flex-col items-center justify-center gap-3 rounded-xl border">
                  <LoaderCircle
                    size={30}
                    className="theme-primary-text animate-spin"
                  />
                  <p className="theme-text text-sm font-medium">
                    Memuat detail penggajian...
                  </p>
                  <p className="theme-text-muted text-xs">
                    Mengambil data dari sistem
                  </p>
                </div>
              ) : !data ? (
                <div className="theme-card theme-border flex min-h-80 flex-col items-center justify-center rounded-xl border px-5 text-center">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-50 text-red-600 dark:bg-red-950/50 dark:text-red-400">
                    <AlertCircle size={23} />
                  </div>
                  <h2 className="theme-text mt-4 font-semibold">
                    Detail penggajian tidak tersedia
                  </h2>
                  <p className="theme-text-muted mt-2 max-w-md text-sm">
                    Data tidak ditemukan atau akun tidak memiliki akses untuk
                    melihat penggajian ini.
                  </p>
                  <button
                    type="button"
                    onClick={() => loadDetail()}
                    className={`${buttonPrimary} mt-4`}
                  >
                    <RefreshCw size={15} />
                    Coba Lagi
                  </button>
                </div>
              ) : (
                <>
                  <section className="theme-card theme-border mb-6 rounded-xl border p-5 shadow-sm sm:p-6">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                      <div className="flex items-start gap-4">
                        <div className="theme-primary-text flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-[color-mix(in_srgb,var(--color-primary)_10%,transparent)]">
                          <UserRound size={26} />
                        </div>

                        <div className="min-w-0">
                          <h2 className="theme-text text-xl font-bold">
                            {data.pengguna?.namaLengkap ?? "-"}
                          </h2>
                          <p className="theme-text-muted mt-1 text-sm">
                            {data.pengguna?.kategoriJabatan?.nama ?? "-"}
                          </p>
                          <div className="theme-text-muted mt-3 flex flex-wrap gap-x-5 gap-y-2 text-sm">
                            <span>NIP: {data.pengguna?.nip ?? "-"}</span>
                            <span>Email: {data.pengguna?.email ?? "-"}</span>
                          </div>
                        </div>
                      </div>

                      <span
                        className={`inline-flex w-fit items-center rounded-lg px-3 py-1.5 text-sm font-semibold ${getStatusStyle(data.status)}`}
                      >
                        {getStatusLabel(data.status)}
                      </span>
                    </div>

                    <div className="theme-border mt-6 grid grid-cols-1 gap-3 border-t pt-5 sm:grid-cols-2 lg:grid-cols-4 2xl:grid-cols-6">
                      <InfoItem
                        icon={CalendarDays}
                        label="Periode"
                        value={`${MONTHS[Number(data.bulan) - 1] ?? data.bulan} ${data.tahun}`}
                      />
                      <InfoItem
                        icon={CalendarDays}
                        label="Tanggal Mulai"
                        value={formatDate(data.tanggalMulai)}
                      />
                      <InfoItem
                        icon={CalendarDays}
                        label="Tanggal Selesai"
                        value={formatDate(data.tanggalSelesai)}
                      />
                      <InfoItem
                        icon={BriefcaseBusiness}
                        label="Shift Kerja"
                        value={data.pengguna?.shiftKerjaMaster?.nama ?? "-"}
                      />
                    </div>
                  </section>

                  <section className="mb-6">
                    <div className="mb-4">
                      <h2 className="theme-text text-lg font-bold">
                        Ringkasan Penggajian
                      </h2>
                      <p className="theme-text-muted mt-1 text-sm">
                        Nilai mengikuti hasil kalkulasi yang disimpan sistem.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4 2xl:grid-cols-6">
                      <SummaryCard
                        icon={CalendarDays}
                        label="Total Hari Kerja"
                        value={`${formatNumber(data.totalHariKerja, 0)} hari`}
                        tone="blue"
                      />
                      <SummaryCard
                        icon={Clock3}
                        label="Total Jam Kerja"
                        value={`${formatNumber(data.totalJamKerja)} jam`}
                        tone="indigo"
                      />
                      <SummaryCard
                        icon={Wallet}
                        label="Tarif per Jam"
                        value={formatCurrency(data.tarifPerJam)}
                        tone="emerald"
                      />
                      <SummaryCard
                        icon={Wallet}
                        label="Total Gaji"
                        value={formatCurrency(data.totalGaji)}
                        tone="highlight"
                      />
                    </div>
                  </section>

                  <section className="theme-card theme-border mb-6 overflow-hidden rounded-xl border shadow-sm">
                    <div className="theme-border border-b p-5">
                      <div className="flex items-start gap-3">
                        <div className="theme-primary-text flex h-10 w-10 items-center justify-center rounded-lg bg-[color-mix(in_srgb,var(--color-primary)_10%,transparent)]">
                          <Clock3 size={20} />
                        </div>
                        <div>
                          <h2 className="theme-text font-semibold">
                            Rincian Absensi
                          </h2>
                          <p className="theme-text-muted mt-1 text-sm">
                            {attendance.length} catatan absensi yang dikembalikan
                            sistem.
                          </p>
                        </div>
                      </div>
                    </div>

                    {attendance.length === 0 ? (
                      <div className="flex flex-col items-center px-5 py-12 text-center">
                        <div className="theme-text-muted flex h-12 w-12 items-center justify-center rounded-xl bg-[color-mix(in_srgb,var(--color-text)_5%,transparent)]">
                          <CalendarDays size={23} />
                        </div>
                        <p className="theme-text mt-4 font-semibold">
                          Belum ada rincian absensi
                        </p>
                        <p className="theme-text-muted mt-1 max-w-lg text-sm">
                          Sistem tidak mengembalikan catatan absensi hadir
                          dengan durasi jam kerja untuk periode ini.
                        </p>
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full min-w-[850px] text-left text-sm">
                          <thead className="theme-text-muted theme-border border-b bg-[color-mix(in_srgb,var(--color-text)_3%,transparent)] text-xs uppercase tracking-wide">
                            <tr>
                              <th className="px-5 py-4 font-semibold">
                                Tanggal
                              </th>
                              <th className="px-5 py-4 font-semibold">Masuk</th>
                              <th className="px-5 py-4 font-semibold">
                                Keluar
                              </th>
                              <th className="px-5 py-4 font-semibold">
                                Durasi
                              </th>
                              <th className="px-5 py-4 font-semibold">
                                Status Shift
                              </th>
                              <th className="px-5 py-4 font-semibold">
                                Terlambat
                              </th>
                            </tr>
                          </thead>

                          <tbody className="divide-y divide-[color-mix(in_srgb,var(--color-text)_5%,transparent)]">
                            {attendance.map((item) => (
                              <tr
                                key={item.id}
                                className="transition hover:bg-[color-mix(in_srgb,var(--color-text)_2%,transparent)]"
                              >
                                <td className="theme-text px-5 py-4 font-medium">
                                  {formatDate(item.tanggal)}
                                </td>
                                <td className="theme-text-secondary px-5 py-4">
                                  {formatTime(item.waktuMasuk)}
                                </td>
                                <td className="theme-text-secondary px-5 py-4">
                                  {formatTime(item.waktuKeluar)}
                                </td>
                                <td className="theme-text-secondary px-5 py-4 tabular-nums">
                                  {item.durasiJamKerja != null
                                    ? `${formatNumber(item.durasiJamKerja)} jam`
                                    : item.durasiKerjaMenit != null
                                      ? `${formatNumber(Number(item.durasiKerjaMenit) / 60)} jam`
                                      : "-"}
                                </td>
                                <td className="px-5 py-4">
                                  <span className="theme-text-secondary inline-flex rounded-md bg-[color-mix(in_srgb,var(--color-text)_6%,transparent)] px-2.5 py-1 text-xs font-medium">
                                    {item.statusShift ?? "-"}
                                  </span>
                                </td>
                                <td className="theme-text-secondary px-5 py-4 tabular-nums">
                                  {item.terlambatMenit != null
                                    ? `${formatNumber(item.terlambatMenit, 0)} menit`
                                    : "-"}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </section>

                  <section className="theme-card theme-border mb-6 rounded-xl border p-5 shadow-sm sm:p-6">
                    <div className="flex items-center gap-3">
                      <div className="theme-text-secondary flex h-10 w-10 items-center justify-center rounded-lg bg-[color-mix(in_srgb,var(--color-text)_6%,transparent)]">
                        <FileText size={20} />
                      </div>
                      <div>
                        <h2 className="theme-text font-semibold">
                          Informasi Tambahan
                        </h2>
                        <p className="theme-text-muted mt-1 text-sm">
                          Catatan dan waktu pembaruan data.
                        </p>
                      </div>
                    </div>

                    <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 2xl:grid-cols-4">
                      <InfoItem
                        icon={FileText}
                        label="Catatan"
                        value={data.catatan || "Tidak ada catatan."}
                      />
                      <InfoItem
                        icon={Timer}
                        label="Dibekukan Pada"
                        value={
                          data.dibekukanPada
                            ? formatDate(data.dibekukanPada)
                            : "-"
                        }
                      />
                      <InfoItem
                        icon={CalendarDays}
                        label="Dibuat Pada"
                        value={formatDate(data.dibuatPada)}
                      />
                      <InfoItem
                        icon={RefreshCw}
                        label="Diperbarui Pada"
                        value={formatDate(data.diperbaruiPada)}
                      />
                    </div>
                  </section>
                </>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

function SummaryCard({ icon: Icon, label, value, tone = "blue" }) {
  const toneClasses = {
    blue: {
      wrapper: "theme-card border theme-border",
      icon: "bg-[color-mix(in_srgb,var(--color-primary)_10%,transparent)] theme-primary-text",
    },
    indigo: {
      wrapper: "theme-card border theme-border",
      icon: "bg-[color-mix(in_srgb,var(--color-primary)_10%,transparent)] theme-primary-text",
    },
    emerald: {
      wrapper: "theme-card border theme-border",
      icon: "bg-[color-mix(in_srgb,var(--color-primary)_10%,transparent)] theme-primary-text",
    },
    highlight: {
      wrapper: "border-[color-mix(in_srgb,var(--color-primary)_30%,transparent)] bg-[color-mix(in_srgb,var(--color-primary)_8%,transparent)]",
      icon: "bg-[color-mix(in_srgb,var(--color-primary)_15%,transparent)] theme-primary-text",
    },
  };

  const classes = toneClasses[tone] ?? toneClasses.blue;

  return (
    <div className={`rounded-xl p-5 ${classes.wrapper}`}>
      <div className="flex items-center justify-between gap-3">
        <p className="theme-text-muted text-sm font-medium">{label}</p>
        <div
          className={`flex h-9 w-9 items-center justify-center rounded-lg ${classes.icon}`}
        >
          <Icon size={18} />
        </div>
      </div>
      <p
        className={`mt-4 whitespace-nowrap text-xl font-bold tracking-tight tabular-nums sm:text-2xl ${
          tone === "highlight"
            ? "theme-primary-text"
            : "theme-text"
        }`}
      >
        {value}
      </p>
    </div>
  );
}

function InfoItem({ icon: Icon, label, value }) {
  return (
    <div className="flex min-w-0 items-start gap-3">
      <div className="theme-text-secondary mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[color-mix(in_srgb,var(--color-text)_6%,transparent)]">
        <Icon size={17} />
      </div>
      <div className="min-w-0">
        <p className="theme-text-muted text-xs font-medium uppercase tracking-wide">
          {label}
        </p>
        <p className="theme-text mt-1 break-words text-sm font-medium">
          {value ?? "-"}
        </p>
      </div>
    </div>
  );
}

function AlertBox({ type, message, onClose }) {
  const success = type === "success";
  const Icon = success ? CheckCircle2 : AlertCircle;

  return (
    <div
      role={success ? "status" : "alert"}
      className={`mb-5 flex items-start gap-3 rounded-lg border p-4 text-sm ${
        success
          ? "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-950/30 dark:text-emerald-300"
          : "border-red-200 bg-red-50 text-red-700 dark:border-red-900/60 dark:bg-red-950/30 dark:text-red-300"
      }`}
    >
      <Icon size={19} className="mt-0.5 shrink-0" />
      <p className="min-w-0 flex-1 break-words">{message}</p>
      <button
        type="button"
        aria-label="Tutup notifikasi"
        onClick={onClose}
        className="rounded p-1 hover:bg-black/5 dark:hover:bg-white/5"
      >
        <X size={16} />
      </button>
    </div>
  );
}