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
  "w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:border-blue-500";

const buttonSecondary =
  "inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800";

const buttonPrimary =
  "inline-flex items-center justify-center gap-2 rounded-xl bg-blue-700 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-50";

function Field({ label, required, hint, number, children }) {
  return (
    <label className="block space-y-1.5">
      <span className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-200">
        {number !== undefined && (
          <span className="inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-slate-100 text-[11px] font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
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
        <span className="block text-xs leading-5 text-slate-500 dark:text-slate-400">
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
    <div className="flex h-screen overflow-hidden bg-slate-50 dark:bg-slate-950">
      <Sidebar />

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <Header />

        <main className="min-h-0 flex-1 overflow-y-auto">
          <div className="mx-auto max-w-5xl space-y-6 px-4 py-6 sm:px-6 lg:px-8">
            {/* JUDUL HALAMAN */}
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
                    Edit Kategori Jabatan
                  </h1>
                  <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-500 dark:text-slate-400">
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

            {/* NOTICE */}
            {notice && (
              <div className="flex items-start gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300">
                <CheckCircle2 size={18} className="mt-0.5 shrink-0" />
                <p className="min-w-0 flex-1">{notice}</p>
              </div>
            )}

            {/* ERROR */}
            {error && (
              <div
                role="alert"
                className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/30 dark:text-red-300"
              >
                <AlertCircle size={18} className="mt-0.5 shrink-0" />
                <p className="min-w-0 flex-1">{error}</p>
              </div>
            )}

            {/* LOADING */}
            {loading ? (
              <div className="flex min-h-[300px] flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
                <LoaderCircle
                  size={28}
                  className="animate-spin text-blue-600"
                />
                <p className="mt-3 text-sm text-slate-500">
                  Memuat data kategori...
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* IDENTITAS KATEGORI */}
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

                {/* INFO TARIF */}
                <div className="flex items-start gap-2 rounded-xl border border-blue-100 bg-blue-50/70 p-4 text-sm text-blue-900 dark:border-blue-900/60 dark:bg-blue-950/30 dark:text-blue-200">
                  <Info size={18} className="mt-0.5 shrink-0" />
                  <p className="leading-6">
                    Tarif tidak diubah dari halaman ini. Untuk menambah atau
                    mengubah tarif, gunakan tombol{" "}
                    <strong className="font-semibold">
                      Tambah Tarif
                    </strong>{" "}
                    pada halaman detail agar riwayat tarif lama tetap
                    tersimpan.
                  </p>
                </div>

                {/* TOMBOL AKSI */}
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
                    {saving ? "Menyimpan..." : "Simpan Perubahan"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}