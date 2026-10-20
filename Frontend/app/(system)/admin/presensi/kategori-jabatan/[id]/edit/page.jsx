"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

import Header from "@/app/components/Header";
import Sidebar from "@/app/components/Sidebar";

import {
  getKategoriJabatanById,
  updateKategoriJabatan,
} from "@/services/kategoriJabatan.service";

import {
  ArrowLeft,
  BriefcaseBusiness,
  Wallet,
  CheckCircle2,
  AlertCircle,
  LoaderCircle,
  Save,
  Info,
} from "lucide-react";

/* =========================================================
   HELPERS
========================================================= */

function getErrorMessage(error) {
  return error instanceof Error
    ? error.message
    : "Terjadi kesalahan. Silakan coba kembali.";
}

const inputClass =
  "theme-input w-full rounded-xl border px-3.5 py-2.5 text-sm outline-none transition disabled:cursor-not-allowed disabled:opacity-60";

const buttonSecondary =
  "inline-flex items-center justify-center gap-2 rounded-xl border theme-border theme-card px-4 py-2.5 text-sm font-medium theme-text-secondary hover:bg-[color-mix(in_srgb,var(--color-text)_3%,transparent)] disabled:cursor-not-allowed disabled:opacity-50 transition";

const buttonPrimary =
  "inline-flex items-center justify-center gap-2 rounded-xl theme-primary px-4 py-2.5 text-sm font-semibold text-white hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50 transition";

function Field({ label, required, hint, number, children }) {
  return (
    <label className="block space-y-1.5">
      <span className="flex items-center gap-2 text-sm font-medium theme-text">
        {number !== undefined && (
          <span className="inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[color-mix(in_srgb,var(--color-text)_6%,transparent)] text-[11px] font-semibold theme-text-secondary">
            {number}
          </span>
        )}
        <span>
          {label}
          {required && <span className="ml-1 text-red-500">*</span>}
        </span>
      </span>
      {children}
      {hint && (
        <span className="block text-xs leading-5 theme-text-muted">
          {hint}
        </span>
      )}
    </label>
  );
}

/* =========================================================
   HALAMAN EDIT
========================================================= */

export default function EditKategoriJabatanPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id;

  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [form, setForm] = useState({
    nama: "",
    kode: "",
    keterangan: "",
    status: "aktif",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  /* =======================================================
     LOAD DETAIL
  ======================================================= */

  const loadDetail = useCallback(async () => {
    if (!id) return;

    setLoading(true);
    setError("");

    try {
      const result = await getKategoriJabatanById(id);

      setForm({
        nama: result?.nama ?? "",
        kode: result?.kode ?? "",
        keterangan: result?.keterangan ?? "",
        status: result?.status ?? "aktif",
      });
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadDetail();
  }, [loadDetail]);

  useEffect(() => {
    if (!notice) return;
    const timeout = setTimeout(() => setNotice(""), 4000);
    return () => clearTimeout(timeout);
  }, [notice]);

  /* =======================================================
     FORM
  ======================================================= */

  function updateForm(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    const nama = form.nama.trim();

    if (!nama) {
      setError("Nama kategori jabatan wajib diisi.");
      return;
    }

    setSaving(true);

    try {
      await updateKategoriJabatan(id, {
        nama,
        kode: form.kode.trim(),
        keterangan: form.keterangan.trim(),
        status: form.status,
      });

      setNotice("Kategori jabatan berhasil diperbarui.");

      // Redirect ke halaman detail setelah sukses
      setTimeout(() => {
        router.push(`/admin/presensi/kategori-jabatan/${id}`);
      }, 800);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  function handleBack() {
    if (saving) return;
    router.push(`/admin/presensi/kategori-jabatan/${id}`);
  }

  /* =======================================================
     RENDER
  ======================================================= */

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
            <div className="mx-auto w-full max-w-5xl space-y-6">
              {/* ============================================
                  PAGE HEADER
              ============================================ */}
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex items-start gap-3">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[color-mix(in_srgb,var(--color-primary)_10%,transparent)] theme-primary-text">
                    <BriefcaseBusiness size={23} />
                  </div>

                  <div>
                    <div className="flex items-center gap-2 text-sm theme-text-muted">
                      <span>Presensi</span>
                      <span>/</span>
                      <span>Kategori Jabatan</span>
                      <span>/</span>
                      <span>Edit</span>
                    </div>
                    <h1 className="mt-1 text-2xl font-bold tracking-tight theme-text">
                      Edit Kategori Jabatan
                    </h1>
                    <p className="mt-1 max-w-2xl text-sm leading-6 theme-text-secondary">
                      Perbarui informasi kategori jabatan. Perubahan tarif
                      dilakukan dari halaman detail agar riwayat tetap
                      tersimpan.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleBack}
                  disabled={saving}
                  className={buttonSecondary}
                >
                  <ArrowLeft size={17} />
                  Kembali
                </button>
              </div>

              {/* ============================================
                  NOTICE
              ============================================ */}
              {notice && (
                <div
                  role="status"
                  className="flex items-start gap-3 rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-950/30 dark:text-emerald-300"
                >
                  <CheckCircle2 size={18} className="mt-0.5 shrink-0" />
                  <p className="min-w-0 flex-1">{notice}</p>
                </div>
              )}

              {/* ============================================
                  ERROR
              ============================================ */}
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
                </div>
              )}

              {/* ============================================
                  LOADING / FORM
              ============================================ */}
              {loading ? (
                <div className="flex min-h-[300px] flex-col items-center justify-center gap-3 theme-card rounded-xl border theme-border">
                  <LoaderCircle
                    size={28}
                    className="animate-spin theme-primary-text"
                  />
                  <p className="text-sm font-medium theme-text">
                    Memuat data kategori...
                  </p>
                  <p className="text-xs theme-text-muted">
                    Mengambil data dari sistem
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* ============================================
                      IDENTITAS KATEGORI
                  ============================================ */}
                  <section className="theme-card overflow-hidden rounded-xl border theme-border shadow-sm">
                    <div className="flex items-start gap-3 border-b theme-border p-5 sm:p-6">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[color-mix(in_srgb,var(--color-primary)_10%,transparent)] theme-primary-text">
                        <BriefcaseBusiness size={19} />
                      </div>

                      <div>
                        <h2 className="font-semibold theme-text">
                          Identitas Kategori
                        </h2>
                        <p className="mt-1 text-sm theme-text-muted">
                          Perbarui informasi dasar kategori jabatan.
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-5 p-5 sm:grid-cols-2 sm:p-6">
                      <Field label="Nama kategori" required number={1}>
                        <input
                          required
                          maxLength={100}
                          value={form.nama}
                          onChange={(e) =>
                            updateForm("nama", e.target.value)
                          }
                          placeholder="Contoh: Guru"
                          className={inputClass}
                          disabled={saving}
                        />
                      </Field>

                      <Field
                        label="Kode kategori"
                        hint="Opsional, maksimal 50 karakter."
                        number={2}
                      >
                        <input
                          maxLength={50}
                          value={form.kode}
                          onChange={(e) =>
                            updateForm("kode", e.target.value)
                          }
                          placeholder="Contoh: GR"
                          className={inputClass}
                          disabled={saving}
                        />
                      </Field>

                      <div className="sm:col-span-2">
                        <Field label="Keterangan" number={3}>
                          <textarea
                            rows={4}
                            value={form.keterangan}
                            onChange={(e) =>
                              updateForm("keterangan", e.target.value)
                            }
                            placeholder="Masukkan keterangan kategori jabatan..."
                            className={inputClass}
                            disabled={saving}
                          />
                        </Field>
                      </div>

                      <Field label="Status kategori" required number={4}>
                        <select
                          required
                          value={form.status}
                          onChange={(e) =>
                            updateForm("status", e.target.value)
                          }
                          className={inputClass}
                          disabled={saving}
                        >
                          <option value="aktif">Aktif</option>
                          <option value="nonaktif">Nonaktif</option>
                        </select>
                      </Field>
                    </div>
                  </section>

                  {/* ============================================
                      INFO TARIF
                  ============================================ */}
                  <div className="flex items-start gap-2 rounded-lg border border-blue-200 bg-blue-50/70 p-4 text-sm text-blue-900 dark:border-blue-900/60 dark:bg-blue-950/30 dark:text-blue-200">
                    <Info size={18} className="mt-0.5 shrink-0" />
                    <p className="leading-6">
                      Tarif tidak diubah dari halaman ini. Untuk menambah
                      atau mengubah tarif, gunakan tombol{" "}
                      <strong className="font-semibold">
                        Tambah Tarif
                      </strong>{" "}
                      pada halaman detail agar riwayat tarif lama tetap
                      tersimpan.
                    </p>
                  </div>

                  {/* ============================================
                      ACTION BUTTONS
                  ============================================ */}
                  <div className="flex flex-col-reverse gap-3 border-t theme-border pt-5 sm:flex-row sm:justify-end">
                    <button
                      type="button"
                      onClick={handleBack}
                      disabled={saving}
                      className={buttonSecondary}
                    >
                      Batal
                    </button>

                    <button
                      type="submit"
                      disabled={saving}
                      className={buttonPrimary}
                    >
                      {saving ? (
                        <LoaderCircle size={17} className="animate-spin" />
                      ) : (
                        <Save size={17} />
                      )}
                      {saving ? "Menyimpan..." : "Simpan Perubahan"}
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