"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

import Header from "@/app/components/Header";
import Sidebar from "@/app/components/Sidebar";

import {
  ArrowLeft,
  Clock3,
  Loader2,
  AlertCircle,
  RefreshCw,
  Sun,
  Moon,
  Save,
  Info,
  CheckCircle2,
  Timer,
} from "lucide-react";

import {
  getShiftKerjaById,
  updateShiftKerja,
} from "@/services/shiftKerja.service";

const MASTER_SHIFT_PATH = "/admin/presensi/master-shift";

function formatTime(value) {
  if (!value) return "";
  const match = String(value).match(/(\d{2}):(\d{2})/);
  return match ? `${match[1]}:${match[2]}` : "";
}

function normalizeStatus(value) {
  const status = String(value ?? "").toLowerCase();
  if (status === "aktif") return "aktif";
  if (status === "nonaktif") return "nonaktif";
  return "";
}

function createFormFromApi(shift) {
  if (
    !shift ||
    typeof shift !== "object" ||
    Array.isArray(shift) ||
    !shift.id
  ) {
    return null;
  }

  const status = normalizeStatus(shift.status);

  if (!status) {
    throw new Error(
      "Status shift dari server tidak dikenali. Hubungi admin sistem."
    );
  }

  return {
    id: shift.id,
    nama: shift.nama ?? "",
    kode: shift.kode ?? "",
    jamMasuk: formatTime(shift.jamMasuk),
    jamKeluar: formatTime(shift.jamKeluar),
    toleransiTerlambatMenit: String(
      shift.toleransiTerlambatMenit ?? 15
    ),
    status,
  };
}

function getLateLimit(startTime, tolerance) {
  if (!startTime) return "--:--";

  const [hour, minute] = startTime.split(":").map(Number);

  if (!Number.isFinite(hour) || !Number.isFinite(minute)) {
    return "--:--";
  }

  const total = hour * 60 + minute + Number(tolerance || 0);
  const finalHour = Math.floor(total / 60) % 24;
  const finalMinute = total % 60;

  return `${String(finalHour).padStart(2, "0")}:${String(
    finalMinute
  ).padStart(2, "0")}`;
}

function getShiftLabel(status) {
  return status === "aktif" ? "Aktif" : "Nonaktif";
}

export default function EditMasterShiftPage() {
  const router = useRouter();
  const params = useParams();

  const shiftId = Array.isArray(params?.id) ? params.id[0] : params?.id;

  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const loadShift = useCallback(async () => {
    if (!shiftId) {
      setForm(null);
      setErrorMessage("Shift yang ingin diedit tidak ditemukan.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setErrorMessage("");

    try {
      const response = await getShiftKerjaById(shiftId);
      const mappedForm = createFormFromApi(response);

      if (!mappedForm) {
        setForm(null);
        setErrorMessage(
          "Data shift tidak ditemukan. Silakan kembali dan pilih shift lain."
        );
        return;
      }

      setForm(mappedForm);
    } catch (error) {
      console.error("Gagal mengambil detail shift:", error);
      setForm(null);
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Gagal memuat data shift. Periksa koneksi lalu coba lagi."
      );
    } finally {
      setLoading(false);
    }
  }, [shiftId]);

  useEffect(() => {
    loadShift();
  }, [loadShift]);

  const handleChange = (field, value) => {
    setForm((current) => {
      if (!current) return current;
      return { ...current, [field]: value };
    });
    setErrorMessage("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!form || saving) return;

    const nama = form.nama.trim();
    const kode = form.kode.trim();
    const jamMasuk = form.jamMasuk;
    const jamKeluar = form.jamKeluar;
    const toleranceText = form.toleransiTerlambatMenit;

    if (!nama) {
      setErrorMessage("Nama shift belum diisi. Mohon lengkapi terlebih dahulu.");
      return;
    }

    if (nama.length > 50) {
      setErrorMessage("Nama shift terlalu panjang (maksimal 50 karakter).");
      return;
    }

    if (kode.length > 20) {
      setErrorMessage("Kode shift terlalu panjang (maksimal 20 karakter).");
      return;
    }

    const timePattern = /^([01]\d|2[0-3]):([0-5]\d)$/;

    if (!timePattern.test(jamMasuk)) {
      setErrorMessage("Jam masuk belum diisi dengan benar.");
      return;
    }

    if (!timePattern.test(jamKeluar)) {
      setErrorMessage("Jam pulang belum diisi dengan benar.");
      return;
    }

    const tolerance = Number(toleranceText);

    if (
      toleranceText === "" ||
      !Number.isFinite(tolerance) ||
      !Number.isInteger(tolerance) ||
      tolerance < 0
    ) {
      setErrorMessage(
        "Toleransi keterlambatan harus berupa angka 0 atau lebih."
      );
      return;
    }

    if (!["aktif", "nonaktif"].includes(form.status)) {
      setErrorMessage("Status shift belum dipilih dengan benar.");
      return;
    }

    const payload = {
      nama,
      kode,
      jamMasuk,
      jamKeluar,
      toleransiTerlambatMenit: tolerance,
      status: form.status,
    };

    setSaving(true);
    setErrorMessage("");

    try {
      await updateShiftKerja(shiftId, payload);
      router.push(`${MASTER_SHIFT_PATH}/${shiftId}`);
      router.refresh();
    } catch (error) {
      console.error("Gagal memperbarui shift:", error);
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Perubahan gagal disimpan. Silakan coba lagi."
      );
    } finally {
      setSaving(false);
    }
  };

  /* ---------- LOADING ---------- */
  if (loading) {
    return (
      <PageShell>
        <div className="flex flex-1 items-center justify-center px-6">
          <div className="text-center">
            <Loader2
              size={30}
              className="mx-auto animate-spin text-[var(--color-primary)]"
            />
            <p className="mt-3 text-sm font-semibold theme-text">
              Memuat data shift...
            </p>
            <p className="mt-1 text-xs theme-text-muted">
              Mohon tunggu sebentar.
            </p>
          </div>
        </div>
      </PageShell>
    );
  }

  /* ---------- NOT FOUND ---------- */
  if (!form) {
    return (
      <PageShell>
        <div className="flex flex-1 items-center justify-center px-6 py-10">
          <div className="w-full max-w-md rounded-xl border theme-border theme-card p-8 text-center shadow-sm">
            <Clock3 size={34} className="mx-auto theme-text-muted" />
            <h1 className="mt-4 text-lg font-bold theme-text">
              Shift Tidak Ditemukan
            </h1>
            <p className="mt-2 text-sm leading-6 theme-text-muted">
              {errorMessage || "Data shift tidak tersedia."}
            </p>
            <div className="mt-5 flex flex-wrap justify-center gap-2">
              <button
                type="button"
                onClick={loadShift}
                className="inline-flex h-10 items-center gap-2 rounded-lg border theme-border theme-card px-4 text-sm font-semibold theme-text"
              >
                <RefreshCw size={14} />
                Coba Lagi
              </button>
              <button
                type="button"
                onClick={() => router.push(MASTER_SHIFT_PATH)}
                className="inline-flex h-10 items-center gap-2 rounded-lg theme-primary px-4 text-sm font-semibold"
              >
                <ArrowLeft size={14} />
                Kembali ke Daftar
              </button>
            </div>
          </div>
        </div>
      </PageShell>
    );
  }

  const lateLimit = getLateLimit(
    form.jamMasuk,
    form.toleransiTerlambatMenit
  );

  return (
    <PageShell>
      <div className="w-full px-5 py-6 md:px-8 md:py-8">
        {/* Back */}
        <button
          type="button"
          onClick={() => router.push(`${MASTER_SHIFT_PATH}/${shiftId}`)}
          className="mb-5 inline-flex items-center gap-2 text-sm font-medium theme-text-secondary hover:opacity-80"
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-lg border theme-border theme-card">
            <ArrowLeft size={15} />
          </span>
          Kembali ke Detail Shift
        </button>

        {/* Title */}
        <div className="mb-6 flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border theme-border theme-info">
            <Clock3 size={21} />
          </div>
          <div>
            <h1 className="text-2xl font-bold theme-text">Edit Shift</h1>
            <p className="mt-1 text-sm theme-text-muted">
              Ubah informasi shift di bawah ini, lalu klik{" "}
              <span className="font-semibold theme-text">Simpan Perubahan</span>.
            </p>
          </div>
        </div>

        {/* Error */}
        {errorMessage && (
          <div
            role="alert"
            className="mb-5 flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/30 dark:text-red-300"
          >
            <AlertCircle size={18} className="mt-0.5 shrink-0" />
            <p className="min-w-0 flex-1">{errorMessage}</p>
            <button
              type="button"
              onClick={() => setErrorMessage("")}
              className="text-xs font-semibold underline"
            >
              Tutup
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Ringkasan cepat — 3 kartu di mobile, 6 kolom di 2xl */}
          <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3 2xl:grid-cols-6">
            <SummaryCard
              icon={<Sun size={16} />}
              label="Jam Masuk"
              value={form.jamMasuk || "--:--"}
            />
            <SummaryCard
              icon={<Moon size={16} />}
              label="Jam Pulang"
              value={form.jamKeluar || "--:--"}
            />
            <SummaryCard
              icon={<Timer size={16} />}
              label="Batas Toleransi"
              value={lateLimit}
              hint={`${form.toleransiTerlambatMenit || 0} menit`}
            />
          </div>

          {/* Grid utama */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
            {/* Form */}
            <section className="theme-card overflow-hidden rounded-xl border theme-border shadow-sm">
              <div className="border-b theme-border theme-card-soft px-6 py-5">
                <h2 className="text-sm font-bold theme-text">
                  Informasi Shift
                </h2>
                <p className="mt-1 text-xs theme-text-muted">
                  Isi data berikut dengan lengkap.
                </p>
              </div>

              <div className="space-y-6 p-6">
                {/* Nama */}
                <div>
                  <label
                    htmlFor="shift-name"
                    className="mb-2 block text-sm font-semibold theme-text"
                  >
                    Nama Shift <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="shift-name"
                    type="text"
                    required
                    maxLength={50}
                    value={form.nama}
                    disabled={saving}
                    onChange={(e) => handleChange("nama", e.target.value)}
                    placeholder="Contoh: Shift Pagi"
                    className="theme-input h-11 w-full rounded-lg border px-3 text-sm outline-none focus:border-[var(--color-primary)] disabled:opacity-60"
                  />
                  <p className="mt-1.5 text-xs theme-text-muted">
                    Maksimal 50 karakter.
                  </p>
                </div>

                {/* Kode */}
                <div>
                  <label
                    htmlFor="shift-code"
                    className="mb-2 block text-sm font-semibold theme-text"
                  >
                    Kode Shift{" "}
                    <span className="text-xs font-normal theme-text-muted">
                      (opsional)
                    </span>
                  </label>
                  <input
                    id="shift-code"
                    type="text"
                    maxLength={20}
                    value={form.kode}
                    disabled={saving}
                    onChange={(e) => handleChange("kode", e.target.value)}
                    placeholder="Contoh: PAGI"
                    className="theme-input h-11 w-full rounded-lg border px-3 text-sm outline-none focus:border-[var(--color-primary)] disabled:opacity-60"
                  />
                  <p className="mt-1.5 text-xs theme-text-muted">
                    Singkatan untuk membedakan shift. Maksimal 20 karakter.
                  </p>
                </div>

                {/* Jam */}
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                  <div>
                    <label
                      htmlFor="shift-start"
                      className="mb-2 flex items-center gap-2 text-sm font-semibold theme-text"
                    >
                      <Sun size={15} className="text-[var(--color-primary)]" />
                      Jam Masuk <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="shift-start"
                      type="time"
                      required
                      value={form.jamMasuk}
                      disabled={saving}
                      onChange={(e) =>
                        handleChange("jamMasuk", e.target.value)
                      }
                      className="theme-input h-11 w-full rounded-lg border px-3 text-sm outline-none focus:border-[var(--color-primary)] disabled:opacity-60"
                    />
                    <p className="mt-1.5 text-xs theme-text-muted">
                      Waktu karyawan mulai bekerja.
                    </p>
                  </div>

                  <div>
                    <label
                      htmlFor="shift-end"
                      className="mb-2 flex items-center gap-2 text-sm font-semibold theme-text"
                    >
                      <Moon size={15} className="text-[var(--color-primary)]" />
                      Jam Pulang <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="shift-end"
                      type="time"
                      required
                      value={form.jamKeluar}
                      disabled={saving}
                      onChange={(e) =>
                        handleChange("jamKeluar", e.target.value)
                      }
                      className="theme-input h-11 w-full rounded-lg border px-3 text-sm outline-none focus:border-[var(--color-primary)] disabled:opacity-60"
                    />
                    <p className="mt-1.5 text-xs theme-text-muted">
                      Waktu karyawan selesai bekerja.
                    </p>
                  </div>
                </div>

                {/* Toleransi */}
                <div>
                  <label
                    htmlFor="shift-tolerance"
                    className="mb-2 block text-sm font-semibold theme-text"
                  >
                    Toleransi Keterlambatan{" "}
                    <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      id="shift-tolerance"
                      type="number"
                      min="0"
                      step="1"
                      required
                      value={form.toleransiTerlambatMenit}
                      disabled={saving}
                      onChange={(e) =>
                        handleChange(
                          "toleransiTerlambatMenit",
                          e.target.value
                        )
                      }
                      className="theme-input h-11 w-full rounded-lg border px-3 pr-20 text-sm outline-none focus:border-[var(--color-primary)] disabled:opacity-60"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm theme-text-muted">
                      menit
                    </span>
                  </div>
                  <p className="mt-1.5 text-xs theme-text-muted">
                    Berapa menit keterlambatan yang masih dimaklumi sebelum
                    dihitung terlambat. Contoh: 15 menit.
                  </p>
                </div>

                {/* Status */}
                <div>
                  <label
                    htmlFor="shift-status"
                    className="mb-2 block text-sm font-semibold theme-text"
                  >
                    Status Shift
                  </label>
                  <select
                    id="shift-status"
                    value={form.status}
                    disabled={saving}
                    onChange={(e) => handleChange("status", e.target.value)}
                    className="theme-input h-11 w-full rounded-lg border px-3 text-sm outline-none focus:border-[var(--color-primary)] disabled:opacity-60"
                  >
                    <option value="aktif">Aktif </option>
                    <option value="nonaktif">
                      Nonaktif 
                    </option>
                  </select>
                  <p className="mt-1.5 text-xs theme-text-muted">
                    Pilih <b>Aktif</b> jika shift ini masih digunakan.
                  </p>
                </div>
              </div>
            </section>

            {/* Sidebar kanan */}
            <aside className="space-y-5">
              <section className="theme-card rounded-xl border theme-border shadow-sm">
                <div className="border-b theme-border theme-card-soft px-5 py-5">
                  <h2 className="text-sm font-bold theme-text">
                    Ringkasan Perubahan
                  </h2>
                  <p className="mt-1 text-xs theme-text-muted">
                    Cek sekali lagi sebelum disimpan.
                  </p>
                </div>

                <div className="space-y-4 p-5">
                  <PreviewRow
                    label="Nama Shift"
                    value={form.nama || "Belum diisi"}
                  />
                  <PreviewRow label="Kode" value={form.kode || "—"} />
                  <PreviewRow
                    label="Jam Masuk"
                    value={form.jamMasuk || "--:--"}
                  />
                  <PreviewRow
                    label="Jam Pulang"
                    value={form.jamKeluar || "--:--"}
                  />
                  <PreviewRow
                    label="Toleransi"
                    value={`${form.toleransiTerlambatMenit || 0} menit`}
                  />
                  <PreviewRow label="Batas Toleransi" value={lateLimit} />

                  <div className="flex items-center justify-between gap-3 border-t theme-border pt-4">
                    <span className="text-xs theme-text-muted">Status</span>
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold ${
                        form.status === "aktif"
                          ? "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300"
                          : "border-slate-200 bg-slate-100 text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
                      }`}
                    >
                      <span
                        className={`h-1.5 w-1.5 rounded-full ${
                          form.status === "aktif"
                            ? "bg-emerald-500"
                            : "bg-slate-400"
                        }`}
                      />
                      {getShiftLabel(form.status)}
                    </span>
                  </div>
                </div>
              </section>

              <section className="theme-info rounded-xl border p-4">
                <div className="flex gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border theme-border theme-card">
                    <Info size={15} />
                  </div>
                  <div>
                    <p className="text-xs font-bold">Catatan</p>
                    <p className="mt-1 text-xs leading-5 opacity-80">
                      Perubahan hanya berlaku untuk pengaturan shift ini.
                      Data karyawan dan jabatan tidak ikut berubah.
                    </p>
                  </div>
                </div>
              </section>
            </aside>
          </div>

          {/* Actions */}
          <div className="mt-6 flex flex-wrap justify-end gap-3">
            <button
              type="button"
              disabled={saving}
              onClick={() => router.push(`${MASTER_SHIFT_PATH}/${shiftId}`)}
              className="h-11 rounded-lg border theme-border theme-card px-5 text-sm font-semibold theme-text-secondary disabled:opacity-60"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={saving}
              className="theme-primary inline-flex h-11 items-center justify-center gap-2 rounded-lg px-6 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Save size={16} />
              )}
              {saving ? "Menyimpan..." : "Simpan Perubahan"}
            </button>
          </div>
        </form>
      </div>
    </PageShell>
  );
}

function PageShell({ children }) {
  return (
    <div className="theme-page flex h-screen w-full overflow-hidden">
      <Sidebar />
      <div className="flex min-h-0 min-w-0 flex-1 flex-col">
        <Header />
        <main className="min-h-0 min-w-0 flex-1 overflow-y-auto theme-page">
          {children}
        </main>
      </div>
    </div>
  );
}

function SummaryCard({ icon, label, value, hint }) {
  return (
    <div className="theme-card rounded-xl border theme-border p-4 shadow-sm">
      <div className="flex items-center gap-2 text-xs theme-text-muted">
        <span className="flex h-6 w-6 items-center justify-center rounded-md border theme-border theme-card-soft">
          {icon}
        </span>
        {label}
      </div>
      <p className="mt-2 text-lg font-bold theme-text">{value}</p>
      {hint && <p className="mt-0.5 text-xs theme-text-muted">{hint}</p>}
    </div>
  );
}

function PreviewRow({ label, value }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-xs theme-text-muted">{label}</span>
      <span className="break-words text-right text-sm font-bold theme-text">
        {value || "—"}
      </span>
    </div>
  );
}