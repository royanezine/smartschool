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
  Lightbulb,
  ShieldCheck,
  Eye,
} from "lucide-react";

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

  return (
    <div className="theme-page flex h-screen w-full overflow-hidden">
      <Sidebar
        role="admin"
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
        <div className="shrink-0 border-b theme-border">
          <Header onMenuClick={() => setSidebarOpen(true)} />
        </div>

        <div className="flex min-h-0 flex-1">
          <main className="theme-page min-h-0 min-w-0 flex-1 overflow-y-auto">
            <div className="w-full px-4 py-5 sm:px-6 sm:py-6 lg:px-8 lg:py-8 2xl:px-12">
              
              <div className="mb-4">
                <button
                  type="button"
                  onClick={handleBack}
                  disabled={saving}
                  className="inline-flex w-fit items-center gap-2 text-sm font-medium theme-text-muted transition hover:text-[var(--color-primary)] disabled:opacity-50"
                >
                  <ArrowLeft size={17} />
                  Kembali ke Detail Kategori
                </button>
              </div>

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
              </div>

              {notice && (
                <div
                  role="status"
                  className="mt-6 flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-950/30 dark:text-emerald-300"
                >
                  <CheckCircle2 size={18} className="mt-0.5 shrink-0" />
                  <p className="min-w-0 flex-1">{notice}</p>
                </div>
              )}

              {error && (
                <div
                  role="alert"
                  className="mt-6 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900/60 dark:bg-red-950/30 dark:text-red-300"
                >
                  <AlertCircle size={19} className="mt-0.5 shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold">Permintaan gagal</p>
                    <p className="mt-1 break-words">{error}</p>
                  </div>
                </div>
              )}

              {loading ? (
                <div className="mt-6 flex min-h-[300px] flex-col items-center justify-center gap-3 theme-card rounded-2xl border theme-border">
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
                <form onSubmit={handleSubmit} className="mt-6">
                  <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)] xl:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
                    
                    <div className="min-w-0 space-y-6">
                      <section className="theme-card overflow-hidden rounded-2xl border theme-border shadow-sm">
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

                      <div className="theme-info theme-border flex items-start gap-3 rounded-2xl border p-4">
                        <Info size={17} className="mt-0.5 shrink-0 text-[var(--color-info)]" />
                        <p className="text-xs leading-5">
                          Tarif tidak diubah dari halaman ini. Untuk menambah
                          atau mengubah tarif, gunakan tombol{" "}
                          <strong className="font-semibold">Tambah Tarif</strong>{" "}
                          pada halaman detail agar riwayat tarif lama tetap
                          tersimpan.
                        </p>
                      </div>

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
                    </div>

                    <aside className="flex min-w-0 flex-col gap-6">
                      <div className="theme-card theme-border overflow-hidden rounded-2xl border shadow-sm">
                        <div className="theme-card-soft theme-border flex items-center gap-3 border-b px-5 py-3">
                          <div className="theme-info flex h-8 w-8 shrink-0 items-center justify-center rounded-lg">
                            <Eye className="h-4 w-4" />
                          </div>
                          <h2 className="theme-text text-sm font-bold">
                            Preview Data
                          </h2>
                        </div>
                        <div className="p-5">
                          <div className="space-y-4 text-xs">
                            <div>
                              <p className="theme-text-muted text-[10px] font-semibold uppercase tracking-wider">
                                Nama Kategori
                              </p>
                              <p className="theme-text mt-1 break-words text-sm font-semibold">
                                {form.nama || "Belum diisi"}
                              </p>
                            </div>
                            <div className="theme-border-soft h-px" />
                            <div>
                              <p className="theme-text-muted text-[10px] font-semibold uppercase tracking-wider">
                                Kode
                              </p>
                              <p className="theme-text mt-1 text-sm font-semibold">
                                {form.kode || "-"}
                              </p>
                            </div>
                            <div className="theme-border-soft h-px" />
                            <div>
                              <p className="theme-text-muted text-[10px] font-semibold uppercase tracking-wider">
                                Status
                              </p>
                              <div className="flex items-center gap-2 mt-1">
                                <span
                                  className={`h-2 w-2 rounded-full ${
                                    form.status === "aktif"
                                      ? "bg-[var(--color-success)]"
                                      : "bg-[var(--color-text-muted)]"
                                  }`}
                                />
                                <span className="theme-text text-sm font-semibold capitalize">
                                  {form.status}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="theme-card theme-border overflow-hidden rounded-2xl border shadow-sm">
                        <div className="theme-card-soft theme-border flex items-center gap-3 border-b px-5 py-3">
                          <div className="theme-warning flex h-8 w-8 shrink-0 items-center justify-center rounded-lg">
                            <Lightbulb size={17} />
                          </div>
                          <h2 className="theme-text text-sm font-bold">
                            Panduan
                          </h2>
                        </div>
                        <div className="p-5">
                          <ul className="space-y-3 text-xs leading-5">
                            <li className="flex items-start gap-2">
                              <CheckCircle2
                                size={14}
                                className="mt-0.5 shrink-0 text-[var(--color-success)]"
                              />
                              <span className="theme-text-secondary">
                                Periksa ejaan nama kategori sebelum menyimpan.
                              </span>
                            </li>
                            <li className="flex items-start gap-2">
                              <CheckCircle2
                                size={14}
                                className="mt-0.5 shrink-0 text-[var(--color-success)]"
                              />
                              <span className="theme-text-secondary">
                                Kode kategori membantu membedakan kategori serupa.
                              </span>
                            </li>
                            <li className="flex items-start gap-2">
                              <CheckCircle2
                                size={14}
                                className="mt-0.5 shrink-0 text-[var(--color-success)]"
                              />
                              <span className="theme-text-secondary">
                                Status nonaktif akan menyembunyikan kategori dari form.
                              </span>
                            </li>
                          </ul>
                        </div>
                      </div>

                      <div className="theme-card theme-border rounded-2xl border p-4 shadow-sm">
                        <div className="flex items-start gap-3">
                          <div className="theme-card-soft theme-text-secondary flex h-8 w-8 shrink-0 items-center justify-center rounded-lg">
                            <ShieldCheck className="h-4 w-4" />
                          </div>
                          <div className="min-w-0">
                            <h3 className="theme-text text-sm font-bold">
                              Informasi Sistem
                            </h3>
                            <div className="theme-text-secondary mt-1.5 space-y-1.5 text-xs leading-5">
                              <p>• ID Kategori: {String(id).slice(0, 8)}</p>
                              <p>• Perubahan langsung tersimpan ke server.</p>
                              <p>• Tarif tidak diubah dari halaman ini.</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </aside>
                  </div>
                </form>
              )}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}