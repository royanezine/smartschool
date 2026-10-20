"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

import Header from "@/app/components/Header";
import Sidebar from "@/app/components/Sidebar";

import {
  getPenggajianById,
  updateStatusPenggajian,
} from "@/services/penggajian.service";

import {
  ArrowLeft,
  Save,
  RefreshCw,
  Wallet,
  UserRound,
  CalendarDays,
  Clock3,
  BriefcaseBusiness,
  FileText,
  AlertCircle,
  CheckCircle2,
  LoaderCircle,
  X,
  Info,
} from "lucide-react";

const STATUS_OPTIONS = [
  { value: "draft", label: "Draft" },
  { value: "disetujui", label: "Disetujui" },
  { value: "dibekukan", label: "Dibekukan" },
  { value: "dibayar", label: "Dibayar" },
];

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

const inputClass =
  "theme-input h-11 w-full rounded-lg border px-3 text-sm outline-none transition disabled:cursor-not-allowed disabled:opacity-60";

const buttonSecondary =
  "inline-flex items-center justify-center gap-2 rounded-lg border theme-border theme-card px-4 text-sm font-medium theme-text-secondary hover:bg-[color-mix(in_srgb,var(--color-text)_3%,transparent)] disabled:cursor-not-allowed disabled:opacity-60 transition";

const buttonPrimary =
  "inline-flex h-11 items-center justify-center gap-2 rounded-lg theme-primary px-4 text-sm font-semibold text-white hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60 transition";

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
    month: "short",
    year: "numeric",
  });
}

function getErrorMessage(error) {
  return error instanceof Error
    ? error.message
    : "Terjadi kesalahan saat memproses permintaan.";
}

function normalizeDetailResponse(response) {
  let result = response;

  for (let index = 0; index < 4; index += 1) {
    if (result && typeof result === "object" && result.id) {
      return result;
    }

    if (
      result?.data &&
      typeof result.data === "object" &&
      !Array.isArray(result.data)
    ) {
      result = result.data;
      continue;
    }
    break;
  }

  throw new Error(
    response?.message ||
      "Data detail penggajian tidak ditemukan dalam respons sistem."
  );
}

function normalizeActionResponse(response) {
  if (!response || typeof response !== "object") return {};

  const payload =
    response.data &&
    typeof response.data === "object" &&
    !Array.isArray(response.data)
      ? response.data
      : response;

  return {
    ...payload,
    message: response.message ?? payload.message,
    success: response.success ?? payload.success,
  };
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

export default function EditPenggajianPage() {
  const router = useRouter();
  const params = useParams();

  const id = Array.isArray(params?.id) ? params.id[0] : params?.id;

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [item, setItem] = useState(null);

  const [status, setStatus] = useState("draft");
  const [catatan, setCatatan] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const loadDetail = useCallback(async () => {
    if (!id) {
      setError("ID penggajian tidak ditemukan.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError("");
    setNotice("");

    try {
      const response = await getPenggajianById(id);
      const result = normalizeDetailResponse(response);

      setItem(result);
      setStatus(result.status ?? "draft");
      setCatatan(result.catatan ?? "");
    } catch (err) {
      setItem(null);
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadDetail();
  }, [loadDetail]);

  async function handleSubmit(event) {
    event.preventDefault();

    if (!item?.id || saving) return;

    if (!STATUS_OPTIONS.some((option) => option.value === status)) {
      setError("Status penggajian yang dipilih tidak valid.");
      return;
    }

    const statusBerubah = status !== item.status;
    const catatanBerubah = catatan !== (item.catatan ?? "");

    if (!statusBerubah && !catatanBerubah) {
      setNotice("Tidak ada perubahan yang perlu disimpan.");
      return;
    }

    if (
      status === "dibekukan" &&
      item.status !== "dibekukan" &&
      item.status !== "disetujui"
    ) {
      const confirmed = window.confirm(
        "Status ini akan membekukan data penggajian. Pastikan data sudah benar sebelum melanjutkan."
      );
      if (!confirmed) return;
    }

    setSaving(true);
    setError("");
    setNotice("");

    try {
      const response = await updateStatusPenggajian(item.id, {
        status,
        catatan,
      });

      const result = normalizeActionResponse(response);

      setItem((current) =>
        current ? { ...current, status, catatan } : current
      );

      setNotice(
        result.message || "Perubahan penggajian berhasil disimpan."
      );
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  const bulanLabel = MONTHS[Number(item?.bulan) - 1] ?? item?.bulan ?? "-";

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

        <main className="min-w-0 flex-1 overflow-y-auto theme-page theme-text">
          <div className="w-full px-4 py-5 sm:px-6 sm:py-6 lg:px-8 lg:py-8">
            {/* ============================================
                PAGE HEADER
            ============================================ */}
            <div className="mb-6">
              <div className="mb-2 flex flex-wrap items-center gap-2 text-sm theme-text-muted">
                <button
                  type="button"
                  onClick={() => router.push("/admin/keuangan/penggajian")}
                  className="transition hover:theme-primary-text"
                >
                  Keuangan
                </button>
                <span>/</span>
                <button
                  type="button"
                  onClick={() => router.push("/admin/keuangan/penggajian")}
                  className="transition hover:theme-primary-text"
                >
                  Penggajian
                </button>
                <span>/</span>
                <span className="theme-primary-text">Edit Penggajian</span>
              </div>

              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <h1 className="text-2xl font-bold tracking-tight theme-text sm:text-3xl">
                    Edit Penggajian
                  </h1>
                  <p className="mt-2 max-w-2xl text-sm leading-6 theme-text-secondary">
                    Periksa data penggajian dan sesuaikan status serta catatan
                    sesuai kebutuhan.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => router.push("/admin/keuangan/penggajian")}
                  className={`${buttonSecondary} self-start sm:self-auto`}
                >
                  <ArrowLeft size={16} />
                  Kembali
                </button>
              </div>
            </div>

            {/* ALERT */}
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

            {/* LOADING / NOT FOUND / FORM */}
            {loading ? (
              <div className="flex min-h-72 flex-col items-center justify-center gap-3 theme-card rounded-xl border theme-border">
                <LoaderCircle
                  size={28}
                  className="animate-spin theme-primary-text"
                />
                <p className="text-sm font-medium theme-text">
                  Memuat detail penggajian...
                </p>
                <p className="text-xs theme-text-muted">
                  Mengambil data dari sistem
                </p>
              </div>
            ) : !item ? (
              <div className="flex min-h-72 flex-col items-center justify-center theme-card rounded-xl border theme-border px-5 text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-50 text-red-600 dark:bg-red-950/50 dark:text-red-400">
                  <AlertCircle size={23} />
                </div>
                <h2 className="mt-4 font-semibold theme-text">
                  Data penggajian tidak ditemukan
                </h2>
                <p className="mt-1 max-w-md text-sm theme-text-muted">
                  Periksa kembali data yang dipilih atau muat ulang halaman.
                </p>
                <button
                  type="button"
                  onClick={loadDetail}
                  className={`${buttonPrimary} mt-4`}
                >
                  <RefreshCw size={16} />
                  Coba Lagi
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 gap-5 xl:grid-cols-3">
                  <div className="space-y-5 xl:col-span-2">
                    {/* ============================================
                        INFORMASI PEGAWAI
                    ============================================ */}
                    <section className="theme-card overflow-hidden rounded-xl border theme-border shadow-sm">
                      <div className="border-b theme-border p-4 sm:p-5">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[color-mix(in_srgb,var(--color-primary)_10%,transparent)] theme-primary-text">
                            <UserRound size={20} />
                          </div>
                          <div>
                            <h2 className="font-semibold theme-text">
                              Informasi Pegawai
                            </h2>
                            <p className="mt-1 text-sm theme-text-muted">
                              Identitas pegawai dan periode penggajian.
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 gap-5 p-4 sm:grid-cols-2 sm:p-5">
                        <ReadOnlyField
                          label="Nama Pegawai"
                          value={item.pengguna?.namaLengkap}
                          icon={UserRound}
                        />
                        <ReadOnlyField
                          label="NIP"
                          value={item.pengguna?.nip}
                          icon={BriefcaseBusiness}
                        />
                        <ReadOnlyField
                          label="Kategori Jabatan"
                          value={
                            item.pengguna?.kategoriJabatan?.nama ??
                            item.pengguna?.jabatan
                          }
                          icon={BriefcaseBusiness}
                        />
                        <ReadOnlyField
                          label="Periode Penggajian"
                          value={`${bulanLabel} ${item.tahun}`}
                          icon={CalendarDays}
                        />
                        <ReadOnlyField
                          label="Tanggal Mulai"
                          value={formatDate(item.tanggalMulai)}
                          icon={CalendarDays}
                        />
                        <ReadOnlyField
                          label="Tanggal Selesai"
                          value={formatDate(item.tanggalSelesai)}
                          icon={CalendarDays}
                        />
                      </div>
                    </section>

                    {/* ============================================
                        RINCIAN PENGGAJIAN
                    ============================================ */}
                    <section className="theme-card overflow-hidden rounded-xl border theme-border shadow-sm">
                      <div className="border-b theme-border p-4 sm:p-5">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[color-mix(in_srgb,var(--color-primary)_10%,transparent)] theme-primary-text">
                            <Wallet size={20} />
                          </div>
                          <div>
                            <h2 className="font-semibold theme-text">
                              Rincian Penggajian
                            </h2>
                            <p className="mt-1 text-sm theme-text-muted">
                              Nilai hasil kalkulasi yang tercatat dalam
                              sistem.
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 gap-5 p-4 sm:grid-cols-2 sm:p-5">
                        <ReadOnlyField
                          label="Total Hari Kerja"
                          value={`${formatNumber(item.totalHariKerja, 0)} hari`}
                          icon={CalendarDays}
                        />
                        <ReadOnlyField
                          label="Total Jam Kerja"
                          value={`${formatNumber(item.totalJamKerja)} jam`}
                          icon={Clock3}
                        />
                        <ReadOnlyField
                          label="Tarif per Jam"
                          value={formatCurrency(item.tarifPerJam)}
                          icon={Wallet}
                        />

                        <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-900/60 dark:bg-blue-950/30">
                          <p className="text-sm font-medium text-blue-800 dark:text-blue-300">
                            Total Gaji
                          </p>
                          <p className="mt-2 break-words text-xl font-bold tabular-nums text-blue-900 dark:text-blue-100 sm:text-2xl">
                            {formatCurrency(item.totalGaji)}
                          </p>
                        </div>
                      </div>

                      <div className="mx-4 mb-4 flex items-start gap-2 rounded-lg border theme-border bg-[color-mix(in_srgb,var(--color-text)_3%,transparent)] p-3 text-xs leading-5 theme-text-secondary sm:mx-5 sm:mb-5">
                        <Info
                          size={16}
                          className="mt-0.5 shrink-0 theme-primary-text"
                        />
                        <p>
                          Rincian jam kerja, tarif, dan total gaji ditampilkan
                          sebagai baca-saja. Perubahan nilai tersebut
                          memerlukan fitur pembaruan khusus dari sistem.
                        </p>
                      </div>
                    </section>
                  </div>

                  {/* ============================================
                      PENGATURAN PENGGAJIAN
                  ============================================ */}
                  <div className="space-y-5">
                    <section className="theme-card overflow-hidden rounded-xl border theme-border shadow-sm">
                      <div className="border-b theme-border p-4 sm:p-5">
                        <h2 className="font-semibold theme-text">
                          Pengaturan Penggajian
                        </h2>
                        <p className="mt-1 text-sm theme-text-muted">
                          Ubah status dan catatan data penggajian.
                        </p>
                      </div>

                      <div className="space-y-5 p-4 sm:p-5">
                        <div>
                          <label
                            htmlFor="status"
                            className="mb-2 block text-sm font-medium theme-text"
                          >
                            Status Penggajian
                          </label>
                          <select
                            id="status"
                            value={status}
                            onChange={(event) =>
                              setStatus(event.target.value)
                            }
                            required
                            className={inputClass}
                          >
                            {STATUS_OPTIONS.map((option) => (
                              <option key={option.value} value={option.value}>
                                {option.label}
                              </option>
                            ))}
                          </select>

                          <div className="mt-3">
                            <span
                              className={`inline-flex items-center rounded-md px-2.5 py-1 text-xs font-semibold ${getStatusStyle(
                                status
                              )}`}
                            >
                              Status dipilih:{" "}
                              {STATUS_OPTIONS.find(
                                (option) => option.value === status
                              )?.label ?? status}
                            </span>
                          </div>
                        </div>

                        <div>
                          <label
                            htmlFor="catatan"
                            className="mb-2 block text-sm font-medium theme-text"
                          >
                            Catatan
                          </label>
                          <textarea
                            id="catatan"
                            value={catatan}
                            onChange={(event) =>
                              setCatatan(event.target.value)
                            }
                            rows={5}
                            maxLength={1000}
                            placeholder="Tambahkan catatan penggajian jika diperlukan..."
                            className="theme-input w-full resize-y rounded-lg border px-3 py-2.5 text-sm outline-none transition disabled:cursor-not-allowed disabled:opacity-60"
                          />
                          <p className="mt-1 text-right text-xs theme-text-muted">
                            {catatan.length}/1000 karakter
                          </p>
                        </div>

                        <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs leading-5 text-amber-800 dark:border-amber-900/60 dark:bg-amber-950/30 dark:text-amber-300">
                          Perubahan status dapat memengaruhi proses penggajian
                          berikutnya. Pastikan status yang dipilih sudah
                          sesuai.
                        </div>

                        <div className="flex flex-col gap-2 pt-1">
                          <button
                            type="submit"
                            disabled={saving || loading}
                            className={buttonPrimary}
                          >
                            {saving ? (
                              <LoaderCircle
                                size={17}
                                className="animate-spin"
                              />
                            ) : (
                              <Save size={17} />
                            )}
                            {saving ? "Menyimpan..." : "Simpan Perubahan"}
                          </button>

                          <button
                            type="button"
                            disabled={saving}
                            onClick={() =>
                              router.push("/admin/keuangan/penggajian")
                            }
                            className={buttonSecondary}
                          >
                            <ArrowLeft size={16} />
                            Kembali ke Daftar
                          </button>
                        </div>
                      </div>
                    </section>

                    {/* ============================================
                        INFORMASI DATA
                    ============================================ */}
                    <section className="theme-card rounded-xl border theme-border p-4 shadow-sm sm:p-5">
                      <div className="flex items-start gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[color-mix(in_srgb,var(--color-text)_6%,transparent)] theme-text-secondary">
                          <FileText size={18} />
                        </div>

                        <div>
                          <h3 className="text-sm font-semibold theme-text">
                            Informasi Data
                          </h3>
                          <p className="mt-1 break-all text-xs leading-5 theme-text-muted">
                            ID Penggajian: {item.id}
                          </p>
                          <p className="mt-1 text-xs leading-5 theme-text-muted">
                            Perubahan status dan catatan dikirim ke sistem
                            melalui fitur pembaruan status penggajian.
                          </p>
                        </div>
                      </div>
                    </section>
                  </div>
                </div>
              </form>
            )}

            <p className="mt-5 text-xs leading-5 theme-text-muted">
              Data penggajian mengikuti data yang tercatat dalam sistem.
            </p>
          </div>
        </main>
      </div>
    </div>
  );
}

/* =========================================================
   READ ONLY FIELD
========================================================= */

function ReadOnlyField({ label, value, icon: Icon }) {
  return (
    <div>
      <p className="mb-2 text-sm font-medium theme-text-secondary">{label}</p>

      <div className="flex min-h-11 items-center gap-3 rounded-lg border theme-border bg-[color-mix(in_srgb,var(--color-text)_3%,transparent)] px-3 py-2">
        <Icon size={16} className="shrink-0 theme-text-muted" />
        <span className="break-words text-sm font-medium theme-text">
          {value === null || value === undefined || value === "" ? "-" : value}
        </span>
      </div>
    </div>
  );
}

/* =========================================================
   ALERT BOX
========================================================= */

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