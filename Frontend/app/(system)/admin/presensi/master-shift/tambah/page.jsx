"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import Header from "@/app/components/Header";
import Sidebar from "@/app/components/Sidebar";

import { createShiftKerja } from "@/services/shiftKerja.service";

import {
  ArrowLeft,
  Clock3,
  Save,
  Loader2,
  AlertCircle,
  Info,
  Sun,
  Moon,
  CheckCircle2,
  X,
} from "lucide-react";

const INITIAL_FORM = {
  nama: "",
  kode: "",
  jamMasuk: "07:00",
  jamKeluar: "14:00",
  toleransiTerlambatMenit: "15",
  status: "aktif",
};

const TIME_REGEX = /^([01]\d|2[0-3]):[0-5]\d$/;

function calculateLateLimit(jamMasuk, toleransi) {
  if (
    !TIME_REGEX.test(jamMasuk) ||
    toleransi === "" ||
    !Number.isInteger(Number(toleransi)) ||
    Number(toleransi) < 0
  ) {
    return "--:--";
  }

  const [hours, minutes] = jamMasuk.split(":").map(Number);
  const total = hours * 60 + minutes + Number(toleransi);
  const normalized = ((total % 1440) + 1440) % 1440;

  const finalHours = Math.floor(normalized / 60);
  const finalMinutes = normalized % 60;

  return `${String(finalHours).padStart(2, "0")}:${String(
    finalMinutes
  ).padStart(2, "0")}`;
}

function FieldLabel({ children, required = false }) {
  return (
    <label className="theme-text-secondary mb-2 block text-xs font-bold uppercase tracking-wider">
      {children}
      {required && (
        <span className="ml-1 text-[var(--color-danger)]">*</span>
      )}
    </label>
  );
}

function PreviewRow({ icon, label, value }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <div className="theme-text-muted flex items-center gap-2 text-xs">
        {icon}
        <span>{label}</span>
      </div>

      <span className="theme-text text-right text-sm font-bold">
        {value}
      </span>
    </div>
  );
}

function getErrorMessage(error) {
  return error instanceof Error
    ? error.message
    : "Terjadi kesalahan saat menyimpan shift kerja.";
}

function validateForm(form) {
  const nama = form.nama.trim();
  const kode = form.kode.trim();
  const toleransi = form.toleransiTerlambatMenit;

  if (!nama) {
    return "Nama shift wajib diisi.";
  }

  if (nama.length > 50) {
    return "Nama shift maksimal 50 karakter.";
  }

  if (kode.length > 20) {
    return "Kode shift maksimal 20 karakter.";
  }

  if (!TIME_REGEX.test(form.jamMasuk)) {
    return "Format jam masuk tidak valid.";
  }

  if (!TIME_REGEX.test(form.jamKeluar)) {
    return "Format jam keluar tidak valid.";
  }

  /*
   * Validasi ini mengikuti asumsi halaman bahwa shift harus
   * selesai pada hari yang sama. Backend saat ini hanya
   * memvalidasi format HH:mm, bukan urutan jam masuk/keluar.
   */
  if (form.jamMasuk >= form.jamKeluar) {
    return "Jam keluar harus lebih besar dari jam masuk. Shift lintas tengah malam belum didukung halaman ini.";
  }

  if (
    toleransi === "" ||
    !Number.isInteger(Number(toleransi)) ||
    Number(toleransi) < 0
  ) {
    return "Toleransi keterlambatan harus berupa bilangan bulat minimal 0 menit.";
  }

  if (!["aktif", "nonaktif"].includes(form.status)) {
    return "Status shift tidak valid.";
  }

  return "";
}

function getCreatedShiftId(response) {
  /*
   * Service createShiftKerja yang sudah dibahas melakukan
   * unwrap terhadap properti data. Bentuk ini juga aman jika
   * service mengembalikan respons mentah Backend.
   */
  const candidates = [
    response?.id,
    response?.data?.id,
    response?.data?.data?.id,
  ];

  return candidates.find(
    (value) => typeof value === "string" && value.length > 0
  );
}

export default function TambahMasterShiftPage() {
  const router = useRouter();

  const [form, setForm] = useState(INITIAL_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const batasTelat = calculateLateLimit(
    form.jamMasuk,
    form.toleransiTerlambatMenit
  );

  function updateField(field, value) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));

    setError("");
  }

  function handleBack() {
    if (saving) return;

    router.push("/admin/presensi/master-shift");
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (saving || success) return;

    setError("");

    const validationError = validateForm(form);

    if (validationError) {
      setError(validationError);
      return;
    }

    setSaving(true);

    try {
      /*
       * Field dan tipe data disesuaikan dengan
       * createShiftKerjaSchema Backend.
       *
       * sekolahId tidak dikirim secara manual karena tenant
       * ditentukan oleh middleware/controller Backend.
       */
      const payload = {
        nama: form.nama.trim(),
        jamMasuk: form.jamMasuk,
        jamKeluar: form.jamKeluar,
        toleransiTerlambatMenit: Number(
          form.toleransiTerlambatMenit
        ),
        status: form.status,
      };

      if (form.kode.trim()) {
        payload.kode = form.kode.trim();
      }

      const response = await createShiftKerja(payload);

      /*
       * createShiftKerja pada service saat ini melakukan
       * unwrap respons. ID dipakai hanya jika tersedia.
       * Respons sukses tidak perlu ditolak hanya karena
       * service tidak mengembalikan ID secara langsung.
       */
      const createdId = getCreatedShiftId(response);

      setSuccess(true);

      if (createdId) {
        router.replace("/admin/presensi/master-shift");
        router.refresh();
        return;
      }

      /*
       * Endpoint berhasil dipanggil. Kembali ke daftar
       * agar data terbaru dimuat dari Backend.
       */
      router.replace("/admin/presensi/master-shift");
      router.refresh();
    } catch (err) {
      console.error("Gagal membuat shift kerja:", err);
      setError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="theme-page theme-text flex min-h-screen w-full">
      <Sidebar />

      <div className="flex min-h-screen min-w-0 flex-1 flex-col">
        <Header />

        <main className="theme-page min-h-0 flex-1">
          <div className="mx-auto w-full max-w-[1500px] px-5 py-6 md:px-8 md:py-8">
            <button
              type="button"
              onClick={handleBack}
              disabled={saving}
              className="theme-text-secondary mb-6 inline-flex items-center gap-2 text-sm font-semibold transition hover:text-[var(--color-primary)] disabled:opacity-50"
            >
              <ArrowLeft size={16} />
              Kembali ke Master Shift
            </button>

            {/* HEADER */}
            <div className="mb-7 flex items-start gap-4">
              <div className="theme-primary flex h-12 w-12 shrink-0 items-center justify-center rounded-xl">
                <Clock3 size={21} />
              </div>

              <div>
                <p className="theme-sidebar-text-active mb-1 text-[11px] font-bold uppercase tracking-widest">
                  Presensi / Master Shift
                </p>

                <h1 className="theme-text text-2xl font-bold tracking-tight md:text-3xl">
                  Tambah Shift Baru
                </h1>

                <p className="theme-text-muted mt-2 max-w-2xl text-sm leading-6">
                  Tambahkan jadwal kerja dengan mengatur nama,
                  kode, jam masuk, jam keluar, toleransi
                  keterlambatan, dan status shift.
                </p>
              </div>
            </div>

            {/* ERROR */}
            {error && (
              <div
                role="alert"
                className="theme-border mb-6 flex items-start gap-3 rounded-xl border p-4"
              >
                <AlertCircle
                  size={19}
                  className="mt-0.5 shrink-0 text-[var(--color-danger)]"
                />

                <div className="min-w-0 flex-1">
                  <p className="theme-text text-sm font-semibold">
                    Shift belum berhasil disimpan
                  </p>

                  <p className="theme-text-muted mt-1 break-words text-sm leading-6">
                    {error}
                  </p>
                </div>

                <button
                  type="button"
                  aria-label="Tutup pesan error"
                  onClick={() => setError("")}
                  className="theme-text-muted rounded p-1"
                >
                  <X size={16} />
                </button>
              </div>
            )}

            {/* SUCCESS */}
            {success && (
              <div
                role="status"
                className="theme-border mb-6 flex items-start gap-3 rounded-xl border p-4"
              >
                <CheckCircle2
                  size={19}
                  className="mt-0.5 shrink-0 text-[var(--color-success)]"
                />

                <div>
                  <p className="theme-text text-sm font-semibold">
                    Shift kerja berhasil dibuat
                  </p>

                  <p className="theme-text-muted mt-1 text-sm">
                    Mengarahkan kembali ke daftar Master Shift.
                  </p>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 items-start gap-6 xl:grid-cols-[minmax(0,1fr)_350px]">
                {/* FORM */}
                <section className="theme-card theme-border overflow-hidden rounded-xl border shadow-sm">
                  <div className="theme-card-soft theme-border flex items-center gap-3 border-b px-5 py-4 md:px-6">
                    <div className="theme-info flex h-9 w-9 items-center justify-center rounded-lg border">
                      <Clock3 size={17} />
                    </div>

                    <div>
                      <h2 className="theme-text text-sm font-bold">
                        Informasi Shift
                      </h2>

                      <p className="theme-text-muted mt-1 text-xs">
                        Lengkapi informasi sesuai validasi Backend.
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-5 p-5 md:grid-cols-2 md:p-6">
                    {/* NAMA */}
                    <div className="md:col-span-2">
                      <FieldLabel required>Nama Shift</FieldLabel>

                      <input
                        type="text"
                        name="nama"
                        required
                        maxLength={50}
                        autoComplete="off"
                        value={form.nama}
                        onChange={(event) =>
                          updateField("nama", event.target.value)
                        }
                        placeholder="Contoh: Shift Pagi"
                        disabled={saving}
                        className="theme-input h-11 w-full rounded-lg border px-3.5 text-sm outline-none focus:border-[var(--color-primary)] disabled:opacity-60"
                      />

                      <p className="theme-text-placeholder mt-1.5 text-xs">
                        Maksimal 50 karakter.
                      </p>
                    </div>

                    {/* KODE */}
                    <div>
                      <FieldLabel>Kode Shift</FieldLabel>

                      <input
                        type="text"
                        name="kode"
                        maxLength={20}
                        autoComplete="off"
                        value={form.kode}
                        onChange={(event) =>
                          updateField(
                            "kode",
                            event.target.value.toUpperCase()
                          )
                        }
                        placeholder="Contoh: PAGI-01"
                        disabled={saving}
                        className="theme-input h-11 w-full rounded-lg border px-3.5 text-sm uppercase outline-none focus:border-[var(--color-primary)] disabled:opacity-60"
                      />

                      <p className="theme-text-placeholder mt-1.5 text-xs">
                        Opsional, maksimal 20 karakter.
                      </p>
                    </div>

                    {/* STATUS */}
                    <div>
                      <FieldLabel required>Status Shift</FieldLabel>

                      <select
                        name="status"
                        value={form.status}
                        onChange={(event) =>
                          updateField("status", event.target.value)
                        }
                        disabled={saving}
                        className="theme-input h-11 w-full rounded-lg border px-3.5 text-sm outline-none focus:border-[var(--color-primary)] disabled:opacity-60"
                      >
                        <option value="aktif">Aktif</option>
                        <option value="nonaktif">Nonaktif</option>
                      </select>
                    </div>

                    {/* JAM MASUK */}
                    <div>
                      <FieldLabel required>Jam Masuk</FieldLabel>

                      <input
                        type="time"
                        name="jamMasuk"
                        required
                        value={form.jamMasuk}
                        onChange={(event) =>
                          updateField("jamMasuk", event.target.value)
                        }
                        disabled={saving}
                        className="theme-input h-11 w-full rounded-lg border px-3.5 text-sm outline-none focus:border-[var(--color-primary)] disabled:opacity-60"
                      />
                    </div>

                    {/* JAM KELUAR */}
                    <div>
                      <FieldLabel required>Jam Keluar</FieldLabel>

                      <input
                        type="time"
                        name="jamKeluar"
                        required
                        value={form.jamKeluar}
                        onChange={(event) =>
                          updateField("jamKeluar", event.target.value)
                        }
                        disabled={saving}
                        className="theme-input h-11 w-full rounded-lg border px-3.5 text-sm outline-none focus:border-[var(--color-primary)] disabled:opacity-60"
                      />
                    </div>

                    {/* TOLERANSI */}
                    <div className="md:col-span-2">
                      <FieldLabel required>
                        Toleransi Keterlambatan
                      </FieldLabel>

                      <div className="relative">
                        <input
                          type="number"
                          name="toleransiTerlambatMenit"
                          required
                          min="0"
                          step="1"
                          value={form.toleransiTerlambatMenit}
                          onChange={(event) =>
                            updateField(
                              "toleransiTerlambatMenit",
                              event.target.value
                            )
                          }
                          disabled={saving}
                          className="theme-input h-11 w-full rounded-lg border px-3.5 pr-20 text-sm outline-none focus:border-[var(--color-primary)] disabled:opacity-60"
                        />

                        <span className="theme-text-placeholder absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-semibold">
                          menit
                        </span>
                      </div>

                      <p className="theme-text-placeholder mt-1.5 text-xs">
                        Harus berupa bilangan bulat minimal 0 menit.
                      </p>
                    </div>
                  </div>

                  {/* ACTIONS */}
                  <div className="theme-card-soft theme-border flex flex-col-reverse gap-3 border-t px-5 py-4 sm:flex-row sm:justify-end md:px-6">
                    <button
                      type="button"
                      disabled={saving}
                      onClick={handleBack}
                      className="theme-card theme-border theme-text-secondary h-11 rounded-lg border px-5 text-sm font-semibold disabled:opacity-50"
                    >
                      Batal
                    </button>

                    <button
                      type="submit"
                      disabled={saving || success}
                      className="theme-primary inline-flex h-11 items-center justify-center gap-2 rounded-lg px-5 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {saving ? (
                        <>
                          <Loader2
                            size={16}
                            className="animate-spin"
                          />
                          Menyimpan...
                        </>
                      ) : (
                        <>
                          <Save size={16} />
                          Simpan Shift
                        </>
                      )}
                    </button>
                  </div>
                </section>

                {/* PREVIEW */}
                <aside className="space-y-5">
                  <section className="theme-card theme-border overflow-hidden rounded-xl border shadow-sm">
                    <div className="theme-card-soft theme-border border-b px-5 py-4">
                      <div className="flex items-center gap-2">
                        <Info
                          size={16}
                          className="theme-sidebar-text-active"
                        />

                        <h2 className="theme-text text-sm font-bold">
                          Preview Jadwal
                        </h2>
                      </div>
                    </div>

                    <div className="space-y-4 p-5">
                      <PreviewRow
                        icon={<Sun size={15} />}
                        label="Jam Masuk"
                        value={form.jamMasuk || "--:--"}
                      />

                      <div className="theme-border border-t" />

                      <PreviewRow
                        icon={<Moon size={15} />}
                        label="Jam Keluar"
                        value={form.jamKeluar || "--:--"}
                      />

                      <div className="theme-border border-t" />

                      <PreviewRow
                        icon={<Clock3 size={15} />}
                        label="Toleransi"
                        value={
                          form.toleransiTerlambatMenit === ""
                            ? "-- menit"
                            : `${form.toleransiTerlambatMenit} menit`
                        }
                      />

                      <div className="theme-border border-t" />

                      <PreviewRow
                        icon={<AlertCircle size={15} />}
                        label="Batas Toleransi"
                        value={batasTelat}
                      />

                      <div className="theme-border border-t pt-4">
                        <p className="theme-text-muted mb-2 text-xs">
                          Status
                        </p>

                        <div className="flex items-center gap-2">
                          <span
                            className={`h-2 w-2 rounded-full ${
                              form.status === "aktif"
                                ? "bg-[var(--color-success)]"
                                : "bg-[var(--color-danger)]"
                            }`}
                          />

                          <span className="theme-text text-sm font-semibold">
                            {form.status === "aktif"
                              ? "Aktif"
                              : "Nonaktif"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </section>

                  <section className="theme-info rounded-xl border p-4">
                    <div className="flex items-start gap-3">
                      <CheckCircle2
                        size={18}
                        className="mt-0.5 shrink-0"
                      />

                      <div>
                        <h3 className="theme-text text-sm font-semibold">
                          Aturan input
                        </h3>

                        <p className="theme-text-secondary mt-1 text-xs leading-5">
                          Nama maksimal 50 karakter, kode maksimal
                          20 karakter, waktu menggunakan format HH:mm,
                          toleransi berupa bilangan bulat minimal 0,
                          dan status berupa aktif atau nonaktif.
                        </p>
                      </div>
                    </div>
                  </section>
                </aside>
              </div>
            </form>
          </div>
        </main>
      </div>
    </div>
  );
}
