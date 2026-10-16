
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
  "w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:border-blue-500";

const buttonSecondary =
  "inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800";

const buttonPrimary =
  "inline-flex items-center justify-center gap-2 rounded-xl bg-blue-700 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-50";

function Field({ label, required, hint, children }) {
  return (
    <label className="block space-y-1.5">
      <span className="text-sm font-medium text-slate-700 dark:text-slate-200">
        {label}
        {required && <span className="ml-1 text-red-500">*</span>}
      </span>

      {children}

      {hint && (
        <span className="block text-xs leading-5 text-slate-500 dark:text-slate-400">
          {hint}
        </span>
      )}
    </label>
  );
}

export default function TambahKategoriJabatanPage() {
  const router = useRouter();

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
    <div className="flex h-screen overflow-hidden bg-slate-50 dark:bg-slate-950">
      <Sidebar />

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <Header />

        <main className="min-h-0 flex-1 overflow-y-auto">
          <div className="mx-auto max-w-5xl space-y-6 px-4 py-6 sm:px-6 lg:px-8">
            {/* Judul halaman */}
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
              <div className="flex items-start gap-3">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                  <BriefcaseBusiness size={23} />
                </div>

                <div>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Presensi dan Kepegawaian
                  </p>

                  <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                    Tambah Kategori Jabatan
                  </h1>

                  <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-500 dark:text-slate-400">
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

            {/* Pesan error */}
            {error && (
              <div
                role="alert"
                className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/30 dark:text-red-300"
              >
                <AlertCircle size={18} className="mt-0.5 shrink-0" />

                <p className="min-w-0 flex-1">{error}</p>

                <button
                  type="button"
                  onClick={() => setError("")}
                  className="rounded-md p-1"
                  aria-label="Tutup pesan error"
                >
                  <span aria-hidden="true">×</span>
                </button>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Identitas kategori */}
              <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
                <div className="flex items-start gap-3 border-b border-slate-200 px-5 py-4 dark:border-slate-800 sm:px-6">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300">
                    <BriefcaseBusiness size={19} />
                  </div>

                  <div>
                    <h2 className="font-semibold text-slate-900 dark:text-white">
                      Identitas Kategori
                    </h2>

                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
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

              {/* Tarif awal */}
              <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
                <div className="flex items-start gap-3 border-b border-slate-200 px-5 py-4 dark:border-slate-800 sm:px-6">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300">
                    <Wallet size={19} />
                  </div>

                  <div>
                    <h2 className="font-semibold text-slate-900 dark:text-white">
                      Tarif Awal
                    </h2>

                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
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
                        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-medium text-slate-500">
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

                  <div className="flex items-start gap-2 rounded-xl border border-blue-100 bg-blue-50/70 p-4 text-sm text-blue-900 dark:border-blue-900/60 dark:bg-blue-950/30 dark:text-blue-200">
                    <Info size={18} className="mt-0.5 shrink-0" />

                    <p className="leading-6">
                      Tarif awal akan dikirim bersama data kategori ke
                      backend. Perhitungan gaji tetap mengikuti aturan
                      backend dan periode tarif yang berlaku.
                    </p>
                  </div>
                </div>
              </section>

              {/* Tombol aksi */}
              <div className="flex flex-col-reverse gap-3 border-t border-slate-200 pt-5 dark:border-slate-800 sm:flex-row sm:justify-end">
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
        </main>
      </div>
    </div>
  );
}
