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
  Lightbulb,
  ChevronDown,
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
                  Kembali ke Daftar Kategori
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
              </div>

              {error && (
                <div
                  role="alert"
                  className="mt-4 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900/60 dark:bg-red-950/30 dark:text-red-300"
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

                        <div className="sm:col-span-2">
                          <Field label="Status kategori" required>
                            <div className="relative">
                              <select
                                required
                                value={form.status}
                                onChange={(event) =>
                                  updateForm("status", event.target.value)
                                }
                                className={`${inputClass} appearance-none pr-10`}
                                disabled={saving}
                              >
                                <option value="aktif">Aktif</option>
                                <option value="nonaktif">Nonaktif</option>
                              </select>
                              <ChevronDown
                                size={17}
                                className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 theme-text-muted"
                              />
                            </div>
                          </Field>
                        </div>
                      </div>
                    </section>

                    <section className="theme-card overflow-hidden rounded-2xl border theme-border shadow-sm">
                      <div className="flex items-start gap-3 border-b theme-border p-5 sm:p-6">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[color-mix(in_srgb,var(--color-primary)_10%,transparent)] theme-primary-text">
                          <Wallet size={19} />
                        </div>

                        <div>
                          <h2 className="font-semibold theme-text">
                            Tarif Awal
                          </h2>

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
                  </div>

                  <aside className="flex min-w-0 flex-col gap-6">
                    <div className="bg-[color-mix(in_srgb,var(--color-primary)_10%,transparent)] theme-primary-text theme-border flex items-start gap-3 rounded-2xl border p-4">
                      <Info size={17} className="mt-0.5 shrink-0 theme-primary-text" />
                      <div>
                        <p className="text-sm font-semibold theme-text">
                          Informasi Tarif
                        </p>
                        <p className="mt-1 text-xs leading-5 theme-text-muted">
                          Tarif awal akan dikirim bersama data kategori ke sistem. Perhitungan gaji mengikuti aturan sistem dan periode tarif yang berlaku.
                        </p>
                      </div>
                    </div>

                    <div className="theme-card theme-border overflow-hidden rounded-2xl border shadow-sm">
                      <div className="theme-card-soft theme-border flex items-center gap-3 border-b px-5 py-3">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[color-mix(in_srgb,var(--color-primary)_10%,transparent)] theme-primary-text">
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
                              Nama kategori harus unik agar tidak duplikat.
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
                              Tarif berlaku mulai menjadi dasar perhitungan gaji periode tersebut.
                            </span>
                          </li>
                        </ul>
                      </div>
                    </div>

                    <div className="theme-card theme-border overflow-hidden rounded-2xl border shadow-sm">
                      <div className="theme-card-soft theme-border flex items-center gap-3 border-b px-5 py-3">
                        <div className="bg-[color-mix(in_srgb,var(--color-primary)_10%,transparent)] theme-primary-text flex h-8 w-8 shrink-0 items-center justify-center rounded-lg">
                          <Wallet size={17} />
                        </div>
                        <h2 className="theme-text text-sm font-bold">
                          Ringkasan
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
                              Tarif Awal
                            </p>
                            <p className="theme-text mt-1 text-sm font-semibold">
                              {form.tarifPerJam
                                ? `Rp ${Number(form.tarifPerJam).toLocaleString("id-ID")}`
                                : "Belum diisi"}
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
                  </aside>
                </div>
              </form>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}