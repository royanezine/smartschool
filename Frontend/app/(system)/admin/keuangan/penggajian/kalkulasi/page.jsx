
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import Header from "@/app/components/Header";
import Sidebar from "@/app/components/Sidebar";

import { kalkulasiPenggajian } from "@/services/penggajian.service";

import {
  ArrowLeft,
  Calculator,
  CalendarDays,
  Users,
  Wallet,
  Clock3,
  CheckCircle2,
  AlertCircle,
  LoaderCircle,
  Info,
  RefreshCw,
  X,
  ClipboardList,
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
  "inline-flex h-10 items-center justify-center gap-2 rounded-lg border theme-border theme-card px-4 text-sm font-medium theme-text-secondary transition hover:bg-[color-mix(in_srgb,var(--color-text)_4%,transparent)] disabled:cursor-not-allowed disabled:opacity-60";

const buttonPrimary =
  "inline-flex h-11 items-center justify-center gap-2 rounded-lg theme-primary px-5 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60";

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

function normalizeActionResponse(response) {
  if (!response || typeof response !== "object") {
    return {};
  }

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

function getErrorMessage(error) {
  return error instanceof Error
    ? error.message
    : "Terjadi kesalahan saat melakukan kalkulasi penggajian.";
}

export default function KalkulasiPenggajianPage() {
  const router = useRouter();
  const now = new Date();

  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [bulan, setBulan] = useState(
    String(now.getMonth() + 1)
  );

  const [tahun, setTahun] = useState(
    String(now.getFullYear())
  );

  const [penggunaId, setPenggunaId] = useState("");

  const [calculating, setCalculating] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [result, setResult] = useState(null);

  function validateForm() {
    const monthNumber = Number(bulan);
    const yearNumber = Number(tahun);

    if (
      !Number.isInteger(monthNumber) ||
      monthNumber < 1 ||
      monthNumber > 12
    ) {
      setError("Silakan pilih bulan yang valid.");
      return false;
    }

    if (
      !Number.isInteger(yearNumber) ||
      yearNumber < 2000 ||
      yearNumber > 2100
    ) {
      setError("Tahun harus berada di antara 2000 sampai 2100.");
      return false;
    }

    return true;
  }

  async function handleCalculate(event) {
    event.preventDefault();

    if (calculating) return;

    setError("");
    setNotice("");
    setResult(null);

    if (!validateForm()) return;

    const confirmed = window.confirm(
      `Jalankan kalkulasi penggajian periode ${MONTHS[Number(bulan) - 1]} ${tahun}?\n\n${
        penggunaId.trim()
          ? "Kalkulasi hanya untuk pegawai dengan ID yang dimasukkan."
          : "Kalkulasi akan dijalankan untuk seluruh pegawai yang memenuhi kriteria."
      }\n\nData berstatus disetujui, dibekukan, atau dibayar akan dilewati.`
    );

    if (!confirmed) return;

    setCalculating(true);

    try {
      const payload = {
        bulan: Number(bulan),
        tahun: Number(tahun),
        ...(penggunaId.trim()
          ? { penggunaId: penggunaId.trim() }
          : {}),
      };

      const response = await kalkulasiPenggajian(payload);
      const data = normalizeActionResponse(response);

      setResult({
        totalDiproses: Number(data.totalDiproses ?? 0),
        totalDilewati: Number(data.totalDilewati ?? 0),
        hasil: Array.isArray(data.hasil) ? data.hasil : [],
        dilewati: Array.isArray(data.dilewati)
          ? data.dilewati
          : [],
      });

      setNotice(
        data.message ||
          "Kalkulasi penggajian berhasil diproses."
      );
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setCalculating(false);
    }
  }

  function handleReset() {
    setBulan(String(now.getMonth() + 1));
    setTahun(String(now.getFullYear()));
    setPenggunaId("");
    setError("");
    setNotice("");
    setResult(null);
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
            <div className="mb-6">
              <button
                type="button"
                onClick={() =>
                  router.push("/admin/keuangan/penggajian")
                }
                className="mb-5 inline-flex items-center gap-2 text-sm font-medium theme-text-secondary transition hover:theme-text"
              >
                <ArrowLeft size={17} />
                Kembali ke Penggajian
              </button>

              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[color-mix(in_srgb,var(--color-primary)_10%,transparent)] theme-primary-text">
                      <Calculator size={24} />
                    </div>

                    <div>
                      <h1 className="text-2xl font-bold tracking-tight theme-text sm:text-3xl">
                        Kalkulasi Penggajian
                      </h1>

                      <p className="mt-1 text-sm theme-text-secondary">
                        Proses perhitungan gaji pegawai berdasarkan
                        rekapitulasi absensi dan tarif per jam.
                      </p>
                    </div>
                  </div>
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

            <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
              <div className="space-y-5 xl:col-span-2">
                <section className="theme-card overflow-hidden rounded-xl border theme-border shadow-sm">
                  <div className="border-b theme-border p-5 sm:p-6">
                    <h2 className="font-semibold theme-text">
                      Pengaturan Kalkulasi
                    </h2>

                    <p className="mt-1 text-sm theme-text-muted">
                      Tentukan periode dan pegawai yang akan dihitung
                      penghasilannya.
                    </p>
                  </div>

                  <form
                    onSubmit={handleCalculate}
                    className="space-y-5 p-5 sm:p-6"
                  >
                    <div>
                      <label className="mb-2 flex items-center gap-2 text-sm font-medium theme-text">
                        <CalendarDays
                          size={16}
                          className="theme-text-muted"
                        />
                        Periode Penggajian
                        <span className="text-red-500">*</span>
                      </label>

                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                        <div>
                          <label className="mb-1.5 block text-xs theme-text-muted">
                            Bulan
                          </label>

                          <select
                            required
                            value={bulan}
                            onChange={(event) =>
                              setBulan(event.target.value)
                            }
                            disabled={calculating}
                            className={inputClass}
                          >
                            {MONTHS.map((month, index) => (
                              <option
                                key={month}
                                value={String(index + 1)}
                              >
                                {month}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="mb-1.5 block text-xs theme-text-muted">
                            Tahun
                          </label>

                          <input
                            type="number"
                            required
                            min="2000"
                            max="2100"
                            value={tahun}
                            onChange={(event) =>
                              setTahun(event.target.value)
                            }
                            disabled={calculating}
                            className={inputClass}
                          />
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="mb-2 flex items-center gap-2 text-sm font-medium theme-text">
                        <Users
                          size={16}
                          className="theme-text-muted"
                        />
                        ID Pengguna
                        <span className="text-xs font-normal theme-text-muted">
                          (Opsional)
                        </span>
                      </label>

                      <input
                        type="text"
                        value={penggunaId}
                        onChange={(event) =>
                          setPenggunaId(event.target.value)
                        }
                        disabled={calculating}
                        placeholder="Masukkan ID pengguna jika ingin menghitung satu pegawai"
                        className={inputClass}
                      />

                      <p className="mt-2 text-xs leading-5 theme-text-muted">
                        Kosongkan kolom ini untuk menjalankan
                        kalkulasi seluruh pegawai yang memenuhi
                        kriteria sistem.
                      </p>
                    </div>

                    <div className="rounded-lg border theme-border p-4">
                      <div className="flex items-start gap-3">
                        <Info
                          size={19}
                          className="mt-0.5 shrink-0 theme-primary-text"
                        />

                        <div>
                          <p className="text-sm font-semibold theme-text">
                            Informasi proses kalkulasi
                          </p>

                          <ul className="mt-2 space-y-2 text-sm leading-6 theme-text-secondary">
                            <li>
                              • Sistem mengambil data absensi
                              dengan status hadir atau terlambat.
                            </li>

                            <li>
                              • Jam kerja dihitung berdasarkan
                              durasi kerja yang tercatat.
                            </li>

                            <li>
                              • Tarif gaji mengikuti riwayat tarif
                              jabatan yang berlaku pada periode.
                            </li>

                            <li>
                              • Data berstatus disetujui, dibekukan,
                              atau dibayar tidak dihitung ulang.
                            </li>

                            <li>
                              • Hasil kalkulasi disimpan dengan
                              status draft.
                            </li>
                          </ul>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col-reverse gap-3 border-t theme-border pt-5 sm:flex-row sm:justify-end">
                      <button
                        type="button"
                        onClick={handleReset}
                        disabled={calculating}
                        className={buttonSecondary}
                      >
                        <RefreshCw size={16} />
                        Reset
                      </button>

                      <button
                        type="submit"
                        disabled={calculating}
                        className={buttonPrimary}
                      >
                        {calculating ? (
                          <LoaderCircle
                            size={17}
                            className="animate-spin"
                          />
                        ) : (
                          <Calculator size={17} />
                        )}

                        {calculating
                          ? "Sedang Menghitung..."
                          : "Mulai Kalkulasi"}
                      </button>
                    </div>
                  </form>
                </section>
              </div>

              <div className="space-y-5">
                <section className="theme-card rounded-xl border theme-border p-5 shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[color-mix(in_srgb,var(--color-primary)_10%,transparent)] theme-primary-text">
                      <ClipboardList size={20} />
                    </div>

                    <div>
                      <h2 className="font-semibold theme-text">
                        Ringkasan Periode
                      </h2>

                      <p className="text-xs theme-text-muted">
                        Periode yang dipilih
                      </p>
                    </div>
                  </div>

                  <div className="mt-5 space-y-4">
                    <div>
                      <p className="text-xs theme-text-muted">
                        Bulan
                      </p>

                      <p className="mt-1 font-semibold theme-text">
                        {MONTHS[Number(bulan) - 1] ?? "-"}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs theme-text-muted">
                        Tahun
                      </p>

                      <p className="mt-1 font-semibold theme-text">
                        {tahun || "-"}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs theme-text-muted">
                        Cakupan kalkulasi
                      </p>

                      <p className="mt-1 font-semibold theme-text">
                        {penggunaId.trim()
                          ? "Satu pegawai"
                          : "Seluruh pegawai"}
                      </p>
                    </div>
                  </div>
                </section>

                <section className="rounded-xl border border-amber-200 bg-amber-50 p-5 dark:border-amber-900/60 dark:bg-amber-950/30">
                  <div className="flex items-start gap-3">
                    <AlertCircle
                      size={20}
                      className="mt-0.5 shrink-0 text-amber-600 dark:text-amber-400"
                    />

                    <div>
                      <h3 className="text-sm font-semibold text-amber-900 dark:text-amber-200">
                        Perhatian
                      </h3>

                      <p className="mt-2 text-sm leading-6 text-amber-800 dark:text-amber-300">
                        Pastikan data absensi dan tarif jabatan
                        sudah sesuai sebelum menjalankan
                        kalkulasi. Data penggajian yang sudah
                        dikunci tidak akan diperbarui.
                      </p>
                    </div>
                  </div>
                </section>
              </div>
            </div>

            {result && (
              <section className="mt-6 theme-card overflow-hidden rounded-xl border theme-border shadow-sm">
                <div className="border-b theme-border p-5 sm:p-6">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <h2 className="font-semibold theme-text">
                        Hasil Kalkulasi Penggajian
                      </h2>

                      <p className="mt-1 text-sm theme-text-muted">
                        Periode {MONTHS[Number(bulan) - 1]} {tahun}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        router.push(
                          "/admin/keuangan/penggajian"
                        )
                      }
                      className={buttonSecondary}
                    >
                      Lihat Daftar Penggajian
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-3 p-5 sm:grid-cols-2">
                  <ResultCard
                    title="Berhasil Diproses"
                    value={result.totalDiproses}
                    description="Data penggajian berhasil dihitung"
                    icon={CheckCircle2}
                    tone="emerald"
                  />

                  <ResultCard
                    title="Dilewati"
                    value={result.totalDilewati}
                    description="Data tidak diproses karena kondisi tertentu"
                    icon={AlertCircle}
                    tone="amber"
                  />
                </div>

                {result.hasil.length > 0 && (
                  <div className="border-t theme-border p-5 sm:p-6">
                    <h3 className="mb-4 font-semibold theme-text">
                      Rincian Pegawai Berhasil Diproses
                    </h3>

                    <div className="overflow-x-auto">
                      <table className="w-full min-w-[650px] text-sm">
                        <thead className="border-b theme-border bg-[color-mix(in_srgb,var(--color-text)_3%,transparent)] text-xs uppercase theme-text-muted">
                          <tr>
                            <th className="px-4 py-3 text-left">
                              Pegawai
                            </th>

                            <th className="px-4 py-3 text-right">
                              Hari Kerja
                            </th>

                            <th className="px-4 py-3 text-right">
                              Jam Kerja
                            </th>

                            <th className="px-4 py-3 text-right">
                              Tarif / Jam
                            </th>

                            <th className="px-4 py-3 text-right">
                              Total Gaji
                            </th>
                          </tr>
                        </thead>

                        <tbody className="divide-y theme-border">
                          {result.hasil.map((item) => (
                            <tr key={item.id}>
                              <td className="px-4 py-3">
                                <p className="font-medium theme-text">
                                  {item.pengguna?.namaLengkap ?? "-"}
                                </p>

                                <p className="mt-1 text-xs theme-text-muted">
                                  {item.pengguna?.email ?? "-"}
                                </p>
                              </td>

                              <td className="px-4 py-3 text-right theme-text-secondary">
                                {formatNumber(
                                  item.totalHariKerja,
                                  0
                                )}
                              </td>

                              <td className="px-4 py-3 text-right theme-text-secondary">
                                {formatNumber(item.totalJamKerja)}
                              </td>

                              <td className="px-4 py-3 text-right theme-text-secondary">
                                {formatCurrency(item.tarifPerJam)}
                              </td>

                              <td className="px-4 py-3 text-right font-semibold theme-text">
                                {formatCurrency(item.totalGaji)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {result.dilewati.length > 0 && (
                  <div className="border-t theme-border p-5 sm:p-6">
                    <h3 className="mb-4 font-semibold theme-text">
                      Pegawai yang Dilewati
                    </h3>

                    <div className="space-y-3">
                      {result.dilewati.map((item, index) => (
                        <div
                          key={`${item.nama ?? "pegawai"}-${index}`}
                          className="flex items-start gap-3 rounded-lg border theme-border p-4"
                        >
                          <AlertCircle
                            size={19}
                            className="mt-0.5 shrink-0 text-amber-600 dark:text-amber-400"
                          />

                          <div className="min-w-0">
                            <p className="text-sm font-semibold theme-text">
                              {item.nama ?? "Pegawai"}
                            </p>

                            <p className="mt-1 text-sm leading-5 theme-text-secondary">
                              {item.alasan ?? "Tidak ada keterangan."}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {result.totalDiproses === 0 &&
                  result.totalDilewati === 0 && (
                    <div className="border-t theme-border p-6 text-center">
                      <p className="text-sm theme-text-muted">
                        Tidak ada data yang diproses pada periode ini.
                      </p>
                    </div>
                  )}
              </section>
            )}

            <p className="mt-6 text-xs leading-5 theme-text-muted">
              Proses kalkulasi menggunakan data absensi, tarif jabatan,
              dan status penggajian yang tersimpan di sistem.
            </p>
          </div>
        </main>
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

      <p className="min-w-0 flex-1 break-words">
        {message}
      </p>

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

function ResultCard({
  title,
  value,
  description,
  icon: Icon,
  tone,
}) {
  const styles = {
    emerald:
      "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300",
    amber:
      "bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300",
  };

  return (
    <div className="rounded-xl border theme-border p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm theme-text-muted">
            {title}
          </p>

          <p className="mt-2 text-2xl font-bold tabular-nums theme-text">
            {value}
          </p>

          <p className="mt-1 text-xs theme-text-muted">
            {description}
          </p>
        </div>

        <div
          className={`flex h-10 w-10 items-center justify-center rounded-lg ${styles[tone]}`}
        >
          <Icon size={20} />
        </div>
      </div>
    </div>
  );
}
