"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import Header from "@/app/components/Header";
import Sidebar from "@/app/components/Sidebar";

import { kalkulasiPenggajian } from "@/services/penggajian.service";

import {
  Calculator,
  ArrowLeft,
  AlertCircle,
  CheckCircle2,
  LoaderCircle,
  X,
  Users,
  Wallet,
  Clock3,
  Info,
  UserX,
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

const inputClass =
  "theme-input h-11 w-full rounded-lg border px-3 text-sm outline-none transition disabled:cursor-not-allowed disabled:opacity-60";

const buttonSecondary =
  "inline-flex h-11 items-center justify-center gap-2 rounded-lg border theme-border theme-card px-4 text-sm font-medium theme-text-secondary hover:bg-[color-mix(in_srgb,var(--color-text)_3%,transparent)] disabled:cursor-not-allowed disabled:opacity-60 transition";

const buttonPrimary =
  "inline-flex h-11 items-center justify-center gap-2 rounded-lg theme-primary px-5 text-sm font-semibold text-white hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60 transition";

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

function getErrorMessage(error) {
  return error instanceof Error
    ? error.message
    : "Terjadi kesalahan saat memproses permintaan.";
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

export default function KalkulasiPenggajianPage() {
  const router = useRouter();
  const now = new Date();

  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [calcMonth, setCalcMonth] = useState(String(now.getMonth() + 1));
  const [calcYear, setCalcYear] = useState(String(now.getFullYear()));
  const [calcEmployeeId, setCalcEmployeeId] = useState("");

  const [calculating, setCalculating] = useState(false);
  const [calcResult, setCalcResult] = useState(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const totalDiproses = useMemo(
    () => Number(calcResult?.totalDiproses ?? 0),
    [calcResult]
  );
  const totalDilewati = useMemo(
    () => Number(calcResult?.totalDilewati ?? 0),
    [calcResult]
  );
  const dilewatiList = useMemo(
    () => (Array.isArray(calcResult?.dilewati) ? calcResult.dilewati : []),
    [calcResult]
  );

  async function handleCalculate(event) {
    event.preventDefault();
    if (calculating) return;

    const monthNumber = Number(calcMonth);
    const yearNumber = Number(calcYear);

    if (
      !Number.isInteger(monthNumber) ||
      monthNumber < 1 ||
      monthNumber > 12 ||
      !Number.isInteger(yearNumber) ||
      yearNumber < 2000 ||
      yearNumber > 2100
    ) {
      setError("Bulan atau tahun kalkulasi tidak valid.");
      return;
    }

    setCalculating(true);
    setError("");
    setNotice("");
    setCalcResult(null);

    try {
      const payload = {
        bulan: monthNumber,
        tahun: yearNumber,
        ...(calcEmployeeId.trim()
          ? { penggunaId: calcEmployeeId.trim() }
          : {}),
      };

      const response = await kalkulasiPenggajian(payload);
      const result = normalizeActionResponse(response);

      setCalcResult(result);
      setNotice(
        result.message || "Permintaan kalkulasi penggajian berhasil."
      );
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setCalculating(false);
    }
  }

  function handleReset() {
    setCalcMonth(String(now.getMonth() + 1));
    setCalcYear(String(now.getFullYear()));
    setCalcEmployeeId("");
    setCalcResult(null);
    setError("");
    setNotice("");
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

        <main className="min-w-0 flex-1 overflow-y-auto theme-page theme-text">
          <div className="mx-auto w-full max-w-5xl px-4 py-5 sm:px-6 sm:py-6 lg:px-8 lg:py-8">
            {/* BACK */}
            <button
              type="button"
              onClick={() => router.push("/admin/keuangan/penggajian")}
              className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium theme-text-muted hover:theme-text transition"
            >
              <ArrowLeft size={16} />
              Kembali ke daftar penggajian
            </button>

            {/* HEADER */}
            <div className="mb-6">
              <h1 className="text-2xl font-bold tracking-tight theme-text sm:text-3xl">
                Kalkulasi Penggajian
              </h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 theme-text-secondary">
                Sistem menghitung gaji berdasarkan absensi valid dan tarif per
                jam yang berlaku. Data berstatus dibekukan atau disetujui akan
                dilewati otomatis.
              </p>
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

            <div className="grid grid-cols-1 gap-5 lg:grid-cols-5">
              {/* FORM */}
              <section className="theme-card rounded-xl border theme-border p-5 shadow-sm lg:col-span-2">
                <div className="mb-4 flex items-center gap-2">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[color-mix(in_srgb,var(--color-primary)_10%,transparent)] theme-primary-text">
                    <Calculator size={18} />
                  </div>
                  <div>
                    <h2 className="text-sm font-semibold theme-text">
                      Parameter Kalkulasi
                    </h2>
                    <p className="text-xs theme-text-muted">
                      Tentukan periode yang akan dihitung
                    </p>
                  </div>
                </div>

                <form onSubmit={handleCalculate} className="space-y-4">
                  <FormField label="Bulan">
                    <select
                      required
                      disabled={calculating}
                      value={calcMonth}
                      onChange={(event) => setCalcMonth(event.target.value)}
                      className={inputClass}
                    >
                      {MONTHS.map((month, index) => (
                        <option key={month} value={String(index + 1)}>
                          {month}
                        </option>
                      ))}
                    </select>
                  </FormField>

                  <FormField label="Tahun">
                    <input
                      type="number"
                      required
                      disabled={calculating}
                      min="2000"
                      max="2100"
                      value={calcYear}
                      onChange={(event) => setCalcYear(event.target.value)}
                      className={inputClass}
                    />
                  </FormField>

                  <FormField label="ID Pengguna (opsional)">
                    <input
                      type="text"
                      disabled={calculating}
                      value={calcEmployeeId}
                      onChange={(event) =>
                        setCalcEmployeeId(event.target.value)
                      }
                      placeholder="Kosongkan untuk semua pegawai"
                      className={inputClass}
                    />
                    <p className="mt-1 text-xs theme-text-muted">
                      Jika diisi, masukkan ID pengguna sesuai data sistem.
                    </p>
                  </FormField>

                  <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs leading-5 text-amber-800 dark:border-amber-900/60 dark:bg-amber-950/30 dark:text-amber-300">
                    <div className="flex gap-2">
                      <Info size={15} className="mt-0.5 shrink-0" />
                      <p>
                        Data berstatus <b>dibekukan</b> atau <b>disetujui</b>{" "}
                        akan dilewati oleh sistem saat kalkulasi.
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 pt-1 sm:flex-row">
                    <button
                      type="button"
                      disabled={calculating}
                      onClick={handleReset}
                      className={`${buttonSecondary} sm:w-auto`}
                    >
                      Reset
                    </button>
                    <button
                      type="submit"
                      disabled={calculating}
                      className={`${buttonPrimary} flex-1`}
                    >
                      {calculating ? (
                        <LoaderCircle size={16} className="animate-spin" />
                      ) : (
                        <Calculator size={16} />
                      )}
                      {calculating ? "Menghitung..." : "Mulai Kalkulasi"}
                    </button>
                  </div>
                </form>
              </section>

              {/* RESULT */}
              <section className="lg:col-span-3">
                {!calcResult && !calculating && (
                  <div className="theme-card flex min-h-72 flex-col items-center justify-center rounded-xl border theme-border p-6 text-center shadow-sm">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[color-mix(in_srgb,var(--color-text)_5%,transparent)] theme-text-muted">
                      <Calculator size={22} />
                    </div>
                    <p className="mt-4 font-semibold theme-text">
                      Belum ada hasil kalkulasi
                    </p>
                    <p className="mt-1 max-w-md text-sm theme-text-muted">
                      Isi parameter di sisi kiri lalu jalankan kalkulasi untuk
                      melihat ringkasan hasil.
                    </p>
                  </div>
                )}

                {calculating && (
                  <div className="theme-card flex min-h-72 flex-col items-center justify-center rounded-xl border theme-border p-6 text-center shadow-sm">
                    <LoaderCircle
                      size={28}
                      className="animate-spin theme-primary-text"
                    />
                    <p className="mt-3 text-sm font-medium theme-text">
                      Menghitung penggajian...
                    </p>
                    <p className="mt-1 text-xs theme-text-muted">
                      Mohon tunggu, proses ini dapat memakan waktu.
                    </p>
                  </div>
                )}

                {calcResult && !calculating && (
                  <div className="space-y-4">
                    {/* SUMMARY */}
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                      <ResultCard
                        title="Data Diproses"
                        value={formatNumber(totalDiproses, 0)}
                        description="Berhasil dihitung sistem"
                        icon={CheckCircle2}
                        tone="emerald"
                      />
                      <ResultCard
                        title="Data Dilewati"
                        value={formatNumber(totalDilewati, 0)}
                        description="Dibekukan / disetujui / tidak valid"
                        icon={UserX}
                        tone="amber"
                      />
                    </div>

                    {/* PERIODE */}
                    <div className="theme-card rounded-xl border theme-border p-4 shadow-sm">
                      <div className="flex items-center gap-2">
                        <Clock3
                          size={16}
                          className="theme-text-muted"
                        />
                        <p className="text-sm theme-text-secondary">
                          Periode:{" "}
                          <span className="font-semibold theme-text">
                            {MONTHS[Number(calcMonth) - 1]} {calcYear}
                          </span>
                          {calcEmployeeId.trim() && (
                            <>
                              {" "}
                              • Pengguna:{" "}
                              <span className="font-semibold theme-text">
                                {calcEmployeeId.trim()}
                              </span>
                            </>
                          )}
                        </p>
                      </div>
                    </div>

                    {/* DILEWATI */}
                    {dilewatiList.length > 0 && (
                      <div className="theme-card rounded-xl border theme-border shadow-sm">
                        <div className="border-b theme-border p-4">
                          <h3 className="text-sm font-semibold theme-text">
                            Detail Data Dilewati
                          </h3>
                          <p className="mt-1 text-xs theme-text-muted">
                            Data berikut tidak dihitung ulang beserta alasannya.
                          </p>
                        </div>
                        <ul className="max-h-96 divide-y divide-[color-mix(in_srgb,var(--color-text)_5%,transparent)] overflow-y-auto">
                          {dilewatiList.map((item, index) => (
                            <li
                              key={`${item.nama ?? "pegawai"}-${index}`}
                              className="flex items-start gap-3 p-4"
                            >
                              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300">
                                <UserX size={15} />
                              </div>
                              <div className="min-w-0">
                                <p className="text-sm font-medium theme-text">
                                  {item.nama ?? "Pegawai"}
                                </p>
                                <p className="mt-1 text-xs theme-text-muted">
                                  {item.alasan ?? "Tidak ada keterangan."}
                                </p>
                              </div>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    <div className="flex flex-col gap-2 pt-1 sm:flex-row sm:justify-end">
                      <button
                        type="button"
                        onClick={() =>
                          router.push("/admin/keuangan/penggajian")
                        }
                        className={buttonSecondary}
                      >
                        <ArrowLeft size={16} />
                        Kembali ke Daftar
                      </button>
                      <button
                        type="button"
                        onClick={handleReset}
                        className={buttonPrimary}
                      >
                        <Calculator size={16} />
                        Kalkulasi Lagi
                      </button>
                    </div>
                  </div>
                )}
              </section>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

/* =========================================================
   RESULT CARD
========================================================= */

function ResultCard({ title, value, description, icon: Icon, tone = "blue" }) {
  const toneClasses = {
    emerald:
      "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300",
    amber:
      "bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300",
    blue: "bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300",
  };

  return (
    <div className="theme-card rounded-xl border theme-border p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-medium theme-text-muted">{title}</p>
          <p className="mt-2 text-2xl font-bold tabular-nums theme-text">
            {value}
          </p>
          <p className="mt-1 text-xs theme-text-muted">{description}</p>
        </div>
        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${
            toneClasses[tone] ?? toneClasses.blue
          }`}
        >
          <Icon size={20} />
        </div>
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

/* =========================================================
   FORM FIELD
========================================================= */

function FormField({ label, children }) {
  return (
    <div>
      <label className="mb-2 block text-sm font-medium theme-text">
        {label}
      </label>
      {children}
    </div>
  );
}