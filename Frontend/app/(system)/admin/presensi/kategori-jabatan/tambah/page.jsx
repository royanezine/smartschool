"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import Header from "@/app/components/Header";
import Sidebar from "@/app/components/Sidebar";

import { createKategoriJabatan } from "@/services/kategoriJabatan.service";

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

const initialForm = {
  nama: "",
  kode: "",
  keterangan: "",
  status: "aktif",
  tarifPerJam: "",
  berlakuMulai: new Date().toLocaleDateString("en-CA", {
    timeZone: "Asia/Jakarta",
  }),
  catatanTarif: "",
};

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

function Field({ label, required, hint, children }) {
  return (
    <label className="block space-y-1.5">
      <span className="text-sm font-medium theme-text">
        {label}
        {required && <span className="ml-1 text-red-500">*</span>}
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

export default function TambahKategoriJabatanPage() {
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [form, setForm] = useState(initialForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  function updateForm(field, value) {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    const nama = form.nama.trim();
    const tarif = Number(form.tarifPerJam);

    if (!nama) {
      setError("Nama kategori jabatan wajib diisi.");
      return;
    }

    if (
      form.tarifPerJam === "" ||
      !Number.isFinite(tarif) ||
      tarif < 0
    ) {
      setError("Tarif per jam wajib berupa angka minimal 0.");
      return;
    }

    if (!form.berlakuMulai) {
      setError("Tanggal mulai berlaku tarif wajib diisi.");
      return;
    }

    setSaving(true);

    try {
      await createKategoriJabatan({
        nama,
        kode: form.kode.trim() || undefined,
        keterangan: form.keterangan.trim() || undefined,
        status: form.status,
        tarifPerJam: tarif,
        berlakuMulai: form.berlakuMulai,
        catatanTarif: form.catatanTarif.trim() || undefined,
      });

      router.push("/admin/presensi/kategori-jabatan");
      router.refresh();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  function handleBack() {
    if (saving) return;
    router.push("/admin/presensi/kategori-jabatan");
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
          <div className="w-full px-4 py-5 sm:px-6 sm:py-6 lg:px-8 lg:py-8">
            <div className="mx-auto w-full max-w-5xl space-y-6">
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
                      <span>Tambah</span>
                    </div>

                    <h1 className="mt-1 text-2xl font-bold tracking-tight theme-text">
                      Tambah Kategori Jabatan
                    </h1>

                    <p className="mt-1 max-w-2xl text-sm leading-6 theme-text-secondary">
                      Tambahkan kategori jabatan baru beserta tarif awal
                      sebagai dasar perhitungan penggajian.
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
                    ×
                  </button>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
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
                        Lengkapi informasi dasar kategori jabatan.
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-5 p-5 sm:grid-cols-2 sm:p-6">
                    <Field label="Nama kategori" required>
                      <input
                        required
                        maxLength={100}
                        value={form.nama}
                        onChange={(event) =>
                          updateForm("nama", event.target.value)
                        }
                        placeholder="Contoh: Guru"
                        className={inputClass}
                        disabled={saving}
                      />
                    </Field>

                    <Field
                      label="Kode kategori"
                      hint="Opsional, maksimal 50 karakter."
                    >
                      <input
                        maxLength={50}
                        value={form.kode}
                        onChange={(event) =>
                          updateForm("kode", event.target.value)
                        }
                        placeholder="Contoh: GR"
                        className={inputClass}
                        disabled={saving}
                      />
                    </Field>

                    <div className="sm:col-span-2">
                      <Field label="Keterangan">
                        <textarea
                          rows={4}
                          value={form.keterangan}
                          onChange={(event) =>
                            updateForm("keterangan", event.target.value)
                          }
                          placeholder="Masukkan keterangan kategori jabatan..."
                          className={inputClass}
                          disabled={saving}
                        />
                      </Field>
                    </div>

                    <Field label="Status kategori" required>
                      <select
                        required
                        value={form.status}
                        onChange={(event) =>
                          updateForm("status", event.target.value)
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

                <section className="theme-card overflow-hidden rounded-xl border theme-border shadow-sm">
                  <div className="flex items-start gap-3 border-b theme-border p-5 sm:p-6">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300">
                      <Wallet size={19} />
                    </div>

                    <div>
                      <h2 className="font-semibold theme-text">Tarif Awal</h2>

                      <p className="mt-1 text-sm theme-text-muted">
                        Tentukan tarif per jam dan tanggal mulai berlakunya.
                      </p>
                    </div>
                  </div>

                  <div className="space-y-5 p-5 sm:p-6">
                    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                      <Field
                        label="Tarif per jam (Rp)"
                        required
                        hint="Masukkan nominal dalam rupiah tanpa tanda titik."
                      >
                        <div className="relative">
                          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-medium theme-text-muted">
                            Rp
                          </span>

                          <input
                            required
                            type="number"
                            min="0"
                            step="1"
                            value={form.tarifPerJam}
                            onChange={(event) =>
                              updateForm("tarifPerJam", event.target.value)
                            }
                            placeholder="Contoh: 25000"
                            className={`${inputClass} pl-10`}
                            disabled={saving}
                          />
                        </div>
                      </Field>

                      <Field label="Berlaku mulai" required>
                        <input
                          required
                          type="date"
                          value={form.berlakuMulai}
                          onChange={(event) =>
                            updateForm("berlakuMulai", event.target.value)
                          }
                          className={inputClass}
                          disabled={saving}
                        />
                      </Field>
                    </div>

                    <Field
                      label="Catatan tarif"
                      hint="Opsional. Misalnya dasar penetapan atau keterangan tarif."
                    >
                      <textarea
                        rows={3}
                        value={form.catatanTarif}
                        onChange={(event) =>
                          updateForm("catatanTarif", event.target.value)
                        }
                        placeholder="Masukkan catatan tarif..."
                        className={inputClass}
                        disabled={saving}
                      />
                    </Field>

                    <div className="flex items-start gap-2 rounded-lg border border-blue-200 bg-blue-50/70 p-4 text-sm text-blue-900 dark:border-blue-900/60 dark:bg-blue-950/30 dark:text-blue-200">
                      <Info size={18} className="mt-0.5 shrink-0" />

                      <p className="leading-6">
                        Tarif awal akan dikirim bersama data kategori ke
                        sistem. Perhitungan gaji mengikuti aturan sistem
                        dan periode tarif yang berlaku.
                      </p>
                    </div>
                  </div>
                </section>

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

                    {saving ? "Menyimpan..." : "Simpan Kategori"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}