
"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

import Header from "@/app/components/Header";
import Sidebar from "@/app/components/Sidebar";

import {
  ArrowLeft,
  Clock3,
  CheckCircle2,
  Loader2,
  AlertCircle,
  RefreshCw,
  Sun,
  Moon,
  Save,
  Info,
} from "lucide-react";

import {
  getShiftKerjaById,
  updateShiftKerja,
} from "@/services/shiftKerja.service";

const MASTER_SHIFT_PATH = "/admin/presensi/master-shift";

/* =========================================================
   HELPERS
========================================================= */

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

/**
 * getShiftKerjaById sudah mengembalikan objek ShiftKerja,
 * bukan response { success, message, data }.
 */
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

  // Jangan mengasumsikan status yang tidak dikenal sebagai aktif.
  if (!status) {
    throw new Error(
      "Status shift dari backend tidak valid. Periksa nilai status pada data shift."
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

/* =========================================================
   PAGE
========================================================= */

export default function EditMasterShiftPage() {
  const router = useRouter();
  const params = useParams();

  const shiftId = Array.isArray(params?.id)
    ? params.id[0]
    : params?.id;

  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  /* =======================================================
     LOAD SHIFT
  ======================================================= */

  const loadShift = useCallback(async () => {
    if (!shiftId) {
      setForm(null);
      setErrorMessage("ID shift tidak ditemukan pada URL.");
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
          "Data shift tidak ditemukan atau respons backend tidak sesuai."
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
          : "Gagal mengambil data shift dari server."
      );
    } finally {
      setLoading(false);
    }
  }, [shiftId]);

  useEffect(() => {
    loadShift();
  }, [loadShift]);

  /* =======================================================
     FORM HANDLER
  ======================================================= */

  const handleChange = (field, value) => {
    setForm((current) => {
      if (!current) return current;

      return {
        ...current,
        [field]: value,
      };
    });

    setErrorMessage("");
  };

  /* =======================================================
     UPDATE SHIFT
  ======================================================= */

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!form || saving) return;

    const nama = form.nama.trim();
    const kode = form.kode.trim();
    const jamMasuk = form.jamMasuk;
    const jamKeluar = form.jamKeluar;
    const toleranceText = form.toleransiTerlambatMenit;

    if (!nama) {
      setErrorMessage("Nama shift wajib diisi.");
      return;
    }

    if (nama.length > 50) {
      setErrorMessage("Nama shift maksimal 50 karakter.");
      return;
    }

    if (kode.length > 20) {
      setErrorMessage("Kode shift maksimal 20 karakter.");
      return;
    }

    const timePattern = /^([01]\d|2[0-3]):([0-5]\d)$/;

    if (!timePattern.test(jamMasuk)) {
      setErrorMessage("Format jam masuk tidak valid.");
      return;
    }

    if (!timePattern.test(jamKeluar)) {
      setErrorMessage("Format jam pulang tidak valid.");
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
        "Toleransi harus berupa bilangan bulat nol atau lebih."
      );
      return;
    }

    if (!["aktif", "nonaktif"].includes(form.status)) {
      setErrorMessage("Status shift tidak valid.");
      return;
    }

    /**
     * Payload mengikuti UpdateShiftKerjaPayload:
     * nama, kode, jamMasuk, jamKeluar,
     * toleransiTerlambatMenit, dan status.
     *
     * Tidak mengirim sekolahId karena update schema
     * yang diberikan tidak menyediakan field tersebut.
     */
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
          : "Gagal menyimpan perubahan shift."
      );
    } finally {
      setSaving(false);
    }
  };

  /* =======================================================
     LOADING
  ======================================================= */

  if (loading) {
    return (
      <PageShell>
        <main className="flex flex-1 items-center justify-center theme-page">
          <div className="text-center">
            <Loader2
              size={30}
              className="mx-auto animate-spin text-[var(--color-primary)]"
            />

            <p className="mt-3 text-sm font-semibold theme-text">
              Memuat data shift...
            </p>

            <p className="mt-1 text-xs theme-text-muted">
              Mengambil data dari server.
            </p>
          </div>
        </main>
      </PageShell>
    );
  }

  /* =======================================================
     NOT FOUND
  ======================================================= */

  if (!form) {
    return (
      <PageShell>
        <main className="flex flex-1 items-center justify-center px-6 theme-page">
          <div className="w-full max-w-md rounded-xl border theme-border theme-card p-8 text-center shadow-sm">
            <Clock3
              size={34}
              className="mx-auto theme-text-muted"
            />

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
                Kembali
              </button>
            </div>
          </div>
        </main>
      </PageShell>
    );
  }

  const lateLimit = getLateLimit(
    form.jamMasuk,
    form.toleransiTerlambatMenit
  );

  /* =======================================================
     MAIN PAGE
  ======================================================= */

  return (
    <PageShell>
      <main className="min-h-0 flex-1 overflow-y-auto theme-page">
        <div className="mx-auto w-full max-w-[1100px] px-5 py-6 md:px-8 md:py-8">
          <button
            type="button"
            onClick={() =>
              router.push(`${MASTER_SHIFT_PATH}/${shiftId}`)
            }
            className="mb-5 inline-flex items-center gap-2 text-sm font-medium theme-text-secondary"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-lg border theme-border theme-card">
              <ArrowLeft size={15} />
            </span>
            Kembali ke Detail Shift
          </button>

          {/* HEADER */}

          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border theme-border theme-info">
              <Clock3 size={21} />
            </div>

            <div>
              <h1 className="text-2xl font-bold theme-text">
                Edit Shift
              </h1>
              <p className="mt-1 text-sm theme-text-muted">
                Perbarui informasi shift sesuai konfigurasi backend.
              </p>
            </div>
          </div>

          {/* ERROR */}

          {errorMessage && (
            <div
              role="alert"
              className="mb-5 flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/30 dark:text-red-300"
            >
              <AlertCircle
                size={18}
                className="mt-0.5 shrink-0"
              />

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
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_310px]">
              {/* FORM */}

              <section className="theme-card overflow-hidden rounded-xl border theme-border shadow-sm">
                <div className="border-b theme-border theme-card-soft px-6 py-5">
                  <h2 className="text-sm font-bold theme-text">
                    Informasi Shift
                  </h2>

                  <p className="mt-1 text-xs theme-text-muted">
                    Field mengikuti schema update shift backend.
                  </p>
                </div>

                <div className="space-y-5 p-6">
                  {/* NAMA */}

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
                      onChange={(event) =>
                        handleChange("nama", event.target.value)
                      }
                      placeholder="Contoh: Shift Pagi"
                      className="theme-input h-11 w-full rounded-lg border px-3 text-sm outline-none focus:border-[var(--color-primary)] disabled:opacity-60"
                    />

                    <p className="mt-1.5 text-xs theme-text-muted">
                      Maksimal 50 karakter.
                    </p>
                  </div>

                  {/* KODE */}

                  <div>
                    <label
                      htmlFor="shift-code"
                      className="mb-2 block text-sm font-semibold theme-text"
                    >
                      Kode Shift
                    </label>

                    <input
                      id="shift-code"
                      type="text"
                      maxLength={20}
                      value={form.kode}
                      disabled={saving}
                      onChange={(event) =>
                        handleChange("kode", event.target.value)
                      }
                      placeholder="Contoh: PAGI"
                      className="theme-input h-11 w-full rounded-lg border px-3 text-sm outline-none focus:border-[var(--color-primary)] disabled:opacity-60"
                    />

                    <p className="mt-1.5 text-xs theme-text-muted">
                      Opsional, maksimal 20 karakter.
                    </p>
                  </div>

                  {/* JAM */}

                  <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                    <div>
                      <label
                        htmlFor="shift-start"
                        className="mb-2 flex items-center gap-2 text-sm font-semibold theme-text"
                      >
                        <Sun
                          size={15}
                          className="text-[var(--color-primary)]"
                        />
                        Jam Masuk <span className="text-red-500">*</span>
                      </label>

                      <input
                        id="shift-start"
                        type="time"
                        required
                        value={form.jamMasuk}
                        disabled={saving}
                        onChange={(event) =>
                          handleChange("jamMasuk", event.target.value)
                        }
                        className="theme-input h-11 w-full rounded-lg border px-3 text-sm outline-none focus:border-[var(--color-primary)] disabled:opacity-60"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="shift-end"
                        className="mb-2 flex items-center gap-2 text-sm font-semibold theme-text"
                      >
                        <Moon
                          size={15}
                          className="text-[var(--color-primary)]"
                        />
                        Jam Pulang <span className="text-red-500">*</span>
                      </label>

                      <input
                        id="shift-end"
                        type="time"
                        required
                        value={form.jamKeluar}
                        disabled={saving}
                        onChange={(event) =>
                          handleChange("jamKeluar", event.target.value)
                        }
                        className="theme-input h-11 w-full rounded-lg border px-3 text-sm outline-none focus:border-[var(--color-primary)] disabled:opacity-60"
                      />
                    </div>
                  </div>

                  {/* TOLERANSI */}

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
                        onChange={(event) =>
                          handleChange(
                            "toleransiTerlambatMenit",
                            event.target.value
                          )
                        }
                        className="theme-input h-11 w-full rounded-lg border px-3 pr-20 text-sm outline-none focus:border-[var(--color-primary)] disabled:opacity-60"
                      />

                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm theme-text-muted">
                        menit
                      </span>
                    </div>

                    <p className="mt-1.5 text-xs theme-text-muted">
                      Bilangan bulat nol atau lebih.
                    </p>
                  </div>

                  {/* STATUS */}

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
                      onChange={(event) =>
                        handleChange("status", event.target.value)
                      }
                      className="theme-input h-11 w-full rounded-lg border px-3 text-sm outline-none focus:border-[var(--color-primary)] disabled:opacity-60"
                    >
                      <option value="aktif">Aktif</option>
                      <option value="nonaktif">Nonaktif</option>
                    </select>
                  </div>
                </div>
              </section>

              {/* PREVIEW */}

              <aside className="space-y-5">
                <section className="theme-card rounded-xl border theme-border shadow-sm">
                  <div className="border-b theme-border theme-card-soft px-5 py-5">
                    <h2 className="text-sm font-bold theme-text">
                      Preview Perubahan
                    </h2>

                    <p className="mt-1 text-xs theme-text-muted">
                      Ringkasan sebelum data disimpan.
                    </p>
                  </div>

                  <div className="space-y-4 p-5">
                    <PreviewRow
                      label="Nama Shift"
                      value={form.nama || "Belum diisi"}
                    />

                    <PreviewRow
                      label="Kode"
                      value={form.kode || "—"}
                    />

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

                    <PreviewRow
                      label="Batas Toleransi"
                      value={lateLimit}
                    />

                    <div className="flex items-center justify-between gap-3 border-t theme-border pt-4">
                      <span className="text-xs theme-text-muted">
                        Status
                      </span>

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

                        {form.status === "aktif" ? "Aktif" : "Nonaktif"}
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
                      <p className="text-xs font-bold">
                        Informasi penyimpanan
                      </p>

                      <p className="mt-1 text-xs leading-5 opacity-80">
                        Perubahan dikirim ke endpoint update shift. Data
                        penugasan pengguna dan kategori jabatan tidak diubah
                        melalui formulir ini.
                      </p>
                    </div>
                  </div>
                </section>
              </aside>
            </div>

            {/* ACTIONS */}

            <div className="mt-6 flex flex-wrap justify-end gap-3">
              <button
                type="button"
                disabled={saving}
                onClick={() =>
                  router.push(`${MASTER_SHIFT_PATH}/${shiftId}`)
                }
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
      </main>
    </PageShell>
  );
}

/* =========================================================
   LAYOUT
========================================================= */

function PageShell({ children }) {
  return (
    <div className="theme-page flex h-screen w-full overflow-hidden">
      <Sidebar />

      <div className="flex h-screen min-w-0 flex-1 flex-col">
        <Header />
        {children}
      </div>
    </div>
  );
}

/* =========================================================
   SUB COMPONENT
========================================================= */

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
