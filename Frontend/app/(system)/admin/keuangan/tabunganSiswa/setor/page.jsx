"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  ArrowDownCircle,
  AlertCircle,
  CheckCircle2,
  Loader2,
  X,
  Info,
} from "lucide-react";

import Sidebar from "@/app/components/Sidebar";
import Header from "@/app/components/Header";
import { setorTabungan } from "@/services/tabungan.service";

const INITIAL_FORM = {
  siswaId: "",
  akunKasId: "",
  jumlah: "",
  tanggal: new Date().toISOString().slice(0, 10),
  keterangan: "",
};

const inputClass =
  "theme-input h-11 w-full rounded-lg border px-3 text-sm outline-none transition disabled:cursor-not-allowed disabled:opacity-60";

const buttonSecondary =
  "inline-flex items-center justify-center gap-2 rounded-lg border theme-border theme-card px-4 py-2.5 text-sm font-medium theme-text-secondary hover:bg-[color-mix(in_srgb,var(--color-text)_3%,transparent)] disabled:cursor-not-allowed disabled:opacity-50 transition";

const buttonPrimary =
  "inline-flex items-center justify-center gap-2 rounded-lg theme-primary px-4 py-2.5 text-sm font-semibold text-white hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50 transition";

function getErrorMessage(error) {
  return error instanceof Error
    ? error.message
    : "Terjadi kesalahan. Silakan coba kembali.";
}

function Field({ label, required, hint, children }) {
  return (
    <div className="space-y-1.5">
      <label className="block text-sm font-medium theme-text">
        {label}
        {required && <span className="ml-1 text-red-500">*</span>}
      </label>
      {children}
      {hint && (
        <p className="text-xs leading-5 theme-text-muted">{hint}</p>
      )}
    </div>
  );
}

/* =========================================================
   INNER — pakai useSearchParams()
========================================================= */

function SetorFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const initialSiswaId = searchParams?.get("siswaId") || "";

  const [form, setForm] = useState({
    ...INITIAL_FORM,
    siswaId: initialSiswaId,
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  function updateForm(field, value) {
    setForm((previous) => ({ ...previous, [field]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setSuccess("");

    const jumlah = Number(form.jumlah);

    if (!form.siswaId.trim()) {
      setError("ID siswa wajib diisi.");
      return;
    }
    if (!form.akunKasId.trim()) {
      setError("ID akun kas wajib diisi.");
      return;
    }
    if (!Number.isFinite(jumlah) || jumlah <= 0) {
      setError("Jumlah transaksi harus lebih dari 0.");
      return;
    }
    if (!form.tanggal) {
      setError("Tanggal transaksi wajib diisi.");
      return;
    }

    setSubmitting(true);

    try {
      await setorTabungan({
        siswaId: form.siswaId.trim(),
        akunKasId: form.akunKasId.trim(),
        jumlah,
        tanggal: form.tanggal,
        ...(form.keterangan.trim()
          ? { keterangan: form.keterangan.trim() }
          : {}),
      });

      setSuccess("Setoran tabungan berhasil disimpan.");

      setTimeout(() => {
        router.push(`/admin/keuangan/tabunganSiswa/${form.siswaId.trim()}`);
      }, 1200);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  function handleBack() {
    if (submitting) return;
    router.push("/admin/keuangan/tabunganSiswa");
  }

  return (
    <div className="mx-auto w-full max-w-3xl space-y-6">
      {/* HEADER */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-3">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300">
            <ArrowDownCircle size={23} />
          </div>

          <div>
            <div className="flex items-center gap-2 text-sm theme-text-muted">
              <span>Keuangan</span>
              <span>/</span>
              <span>Tabungan Siswa</span>
              <span>/</span>
              <span>Setor</span>
            </div>
            <h1 className="mt-1 text-2xl font-bold theme-text">
              Setor Tabungan
            </h1>
            <p className="mt-1 max-w-2xl text-sm leading-6 theme-text-secondary">
              Catat setoran ke rekening tabungan siswa.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleBack}
          disabled={submitting}
          className={buttonSecondary}
        >
          <ArrowLeft size={16} />
          Kembali
        </button>
      </div>

      {/* INFO BANNER */}
      <div className="flex items-start gap-3 rounded-lg border theme-border theme-card p-4">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[color-mix(in_srgb,var(--color-primary)_10%,transparent)] theme-primary-text">
          <Info size={18} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium theme-text">
            Setoran akan tercatat di sistem
          </p>
          <p className="mt-1 text-xs leading-5 theme-text-muted">
            Pastikan ID siswa dan ID akun kas valid. Setoran akan otomatis
            menambah saldo tabungan siswa.
          </p>
        </div>
      </div>

      {/* ALERT */}
      {success && (
        <div
          role="status"
          className="flex items-start gap-3 rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-950/30 dark:text-emerald-300"
        >
          <CheckCircle2 size={18} className="mt-0.5 shrink-0" />
          <p className="flex-1">{success}</p>
        </div>
      )}

      {error && (
        <div
          role="alert"
          className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900/60 dark:bg-red-950/30 dark:text-red-300"
        >
          <AlertCircle size={19} className="mt-0.5 shrink-0" />
          <div className="min-w-0 flex-1">
            <p className="font-semibold">Permintaan gagal</p>
            <p className="mt-1 break-words">{error}</p>
          </div>
          <button
            type="button"
            onClick={() => setError("")}
            aria-label="Tutup pesan error"
            className="rounded p-1 hover:bg-red-100 dark:hover:bg-red-900/40"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* FORM */}
      <form
        onSubmit={handleSubmit}
        className="theme-card space-y-5 rounded-xl border theme-border p-5 shadow-sm sm:p-6"
      >
        <Field
          label="ID Siswa"
          required
          hint="Gunakan ID siswa yang sesuai dengan data sistem."
        >
          <input
            required
            value={form.siswaId}
            onChange={(e) => updateForm("siswaId", e.target.value)}
            placeholder="Masukkan ID siswa"
            className={inputClass}
            disabled={submitting}
          />
        </Field>

        <Field
          label="ID Akun Kas"
          required
          hint="Masukkan ID akun kas aktif yang valid untuk sekolah ini."
        >
          <input
            required
            value={form.akunKasId}
            onChange={(e) => updateForm("akunKasId", e.target.value)}
            placeholder="Masukkan ID akun kas aktif"
            className={inputClass}
            disabled={submitting}
          />
        </Field>

        <Field label="Jumlah (Rp)" required>
          <input
            required
            type="number"
            min="1"
            step="1"
            value={form.jumlah}
            onChange={(e) => updateForm("jumlah", e.target.value)}
            placeholder="Contoh: 50000"
            className={inputClass}
            disabled={submitting}
          />
        </Field>

        <Field label="Tanggal transaksi" required>
          <input
            required
            type="date"
            value={form.tanggal}
            onChange={(e) => updateForm("tanggal", e.target.value)}
            className={inputClass}
            disabled={submitting}
          />
        </Field>

        <Field label="Keterangan">
          <textarea
            rows={3}
            value={form.keterangan}
            onChange={(e) => updateForm("keterangan", e.target.value)}
            placeholder="Keterangan transaksi (opsional)"
            className="theme-input w-full resize-y rounded-lg border px-3 py-2.5 text-sm outline-none transition disabled:cursor-not-allowed disabled:opacity-60"
            disabled={submitting}
          />
        </Field>

        <div className="flex flex-col-reverse gap-3 border-t theme-border pt-5 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={handleBack}
            disabled={submitting}
            className={buttonSecondary}
          >
            Batal
          </button>
          <button
            type="submit"
            disabled={submitting}
            className={buttonPrimary}
          >
            {submitting ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <ArrowDownCircle size={16} />
            )}
            {submitting ? "Memproses..." : "Simpan Setoran"}
          </button>
        </div>
      </form>
    </div>
  );
}

/* =========================================================
   SUSPENSE FALLBACK
========================================================= */

function SetorSuspenseFallback() {
  return (
    <div className="mx-auto w-full max-w-3xl">
      <div className="flex min-h-[300px] flex-col items-center justify-center gap-3 theme-card rounded-xl border theme-border">
        <Loader2 size={28} className="animate-spin theme-primary-text" />
        <p className="text-sm font-medium theme-text">
          Memuat halaman setor tabungan...
        </p>
        <p className="text-xs theme-text-muted">
          Menyiapkan form setoran
        </p>
      </div>
    </div>
  );
}

/* =========================================================
   EXPORT DEFAULT — wrapper dengan Suspense
========================================================= */

export default function SetorTabunganPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

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
            <Suspense fallback={<SetorSuspenseFallback />}>
              <SetorFormContent />
            </Suspense>
          </div>
        </main>
      </div>
    </div>
  );
}