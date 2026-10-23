"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

import Header from "@/app/components/Header";
import Sidebar from "@/app/components/Sidebar";

import {
  getKategoriJabatanById,
  tambahTarifKategoriJabatan,
} from "@/services/kategoriJabatan.service";

import {
  ArrowLeft,
  Wallet,
  BriefcaseBusiness,
  AlertCircle,
  CheckCircle2,
  LoaderCircle,
  Save,
  Info,
  History,
} from "lucide-react";


function formatRupiah(value) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(Number(value ?? 0));
}

function formatTanggal(value) {
  if (!value) return "-";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return String(value);

  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

function getErrorMessage(error) {
  return error instanceof Error
    ? error.message
    : "Terjadi kesalahan. Silakan coba kembali.";
}

function getToday() {
  return new Date().toLocaleDateString("en-CA", {
    timeZone: "Asia/Jakarta",
  });
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


export default function AturTarifKategoriJabatanPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id;

  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [kategori, setKategori] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const [form, setForm] = useState({
    tarifPerJam: "",
    berlakuMulai: getToday(),
    catatan: "",
  });

  const loadDetail = useCallback(async () => {
    if (!id) return;

    setLoading(true);
    setError("");

    try {
      const result = await getKategoriJabatanById(id);
      setKategori(result ?? null);
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
    setForm((previous) => ({ ...previous, [field]: value }));
  }

  function handleBack() {
    if (saving) return;
    router.push(`/admin/presensi/kategori-jabatan/${id}`);
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    const tarif = Number(form.tarifPerJam);

    if (
      form.tarifPerJam === "" ||
      !Number.isFinite(tarif) ||
      tarif < 0
    ) {
      setError("Tarif per jam wajib berupa angka minimal 0.");
      return;
    }

    if (!form.berlakuMulai) {
      setError("Tanggal mulai berlaku wajib diisi.");
      return;
    }

    setSaving(true);

    try {
      await tambahTarifKategoriJabatan(id, {
        tarifPerJam: tarif,
        berlakuMulai: form.berlakuMulai,
        catatan: form.catatan.trim() || undefined,
      });

      setNotice("Tarif baru berhasil disimpan.");

      setTimeout(() => {
        router.push(`/admin/presensi/kategori-jabatan/${id}`);
      }, 800);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  const currentTarif = kategori?.tarifAktif;
  const riwayat = Array.isArray(kategori?.tarifRiwayat)
    ? kategori.tarifRiwayat
    : [];

  return (
    <div className="theme-page flex h-screen w-full overflow-hidden">
      <Sidebar
        role="admin"
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
        <div className="shrink-0">
          <Header onMenuClick={() => setSidebarOpen(true)} />
        </div>

        <main className="min-h-0 min-w-0 flex-1 overflow-y-auto theme-page theme-text">
          <div className="w-full px-4 py-5 sm:px-6 sm:py-6 lg:px-8 lg:py-8">
            <div className="mb-4 flex items-center">
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

            <div className="mb-6 flex items-start gap-3">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[color-mix(in_srgb,var(--color-primary)_10%,transparent)] theme-primary-text">
                <Wallet size={23} />
              </div>

              <div className="min-w-0">
                
                <h1 className="mt-1 text-2xl font-bold tracking-tight theme-text">
                  Atur Tarif Jabatan
                </h1>
                <p className="mt-1 max-w-2xl text-sm leading-6 theme-text-secondary">
                  {loading
                    ? "Memuat data kategori..."
                    : kategori?.nama
                      ? `Tambahkan tarif baru untuk kategori ${kategori.nama}.`
                      : "Tambahkan tarif baru untuk kategori jabatan."}
                </p>
              </div>
            </div>

            {notice && (
              <div
                role="status"
                className="mb-5 flex items-start gap-3 rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-950/30 dark:text-emerald-300"
              >
                <CheckCircle2 size={18} className="mt-0.5 shrink-0" />
                <p className="flex-1">{notice}</p>
              </div>
            )}

            {error && (
              <div
                role="alert"
                className="mb-5 flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900/60 dark:bg-red-950/30 dark:text-red-300"
              >
                <AlertCircle size={19} className="mt-0.5 shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="font-semibold">Permintaan gagal</p>
                  <p className="mt-1 break-words">{error}</p>
                </div>
              </div>
            )}

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
              <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
                <section className="theme-card overflow-hidden rounded-xl border theme-border shadow-sm lg:col-span-2">
                  <div className="flex items-start gap-3 border-b theme-border p-5 sm:p-6">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300">
                      <Wallet size={19} />
                    </div>

                    <div>
                      <h2 className="font-semibold theme-text">Tarif Baru</h2>
                      <p className="mt-1 text-sm theme-text-muted">
                        Tarif baru akan menggantikan tarif aktif saat tanggal
                        berlaku tercapai.
                      </p>
                    </div>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-5 p-5 sm:p-6">
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

                    <Field
                      label="Catatan perubahan"
                      hint="Opsional. Misalnya alasan penyesuaian tarif."
                    >
                      <textarea
                        rows={3}
                        value={form.catatan}
                        onChange={(event) =>
                          updateForm("catatan", event.target.value)
                        }
                        placeholder="Contoh: penyesuaian tarif periode baru"
                        className={inputClass}
                        disabled={saving}
                      />
                    </Field>

                    <div className="flex items-start gap-2 rounded-lg border border-blue-200 bg-blue-50/70 p-4 text-sm text-blue-900 dark:border-blue-900/60 dark:bg-blue-950/30 dark:text-blue-200">
                      <Info size={18} className="mt-0.5 shrink-0" />
                      <p className="leading-6">
                        Sistem akan menutup tarif sebelumnya dan membuat riwayat
                        tarif baru secara otomatis.
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
                        {saving ? "Menyimpan..." : "Simpan Tarif"}
                      </button>
                    </div>
                  </form>
                </section>

                <div className="space-y-5">
                  <section className="theme-card rounded-xl border theme-border p-5 shadow-sm">
                    <div className="flex items-start gap-3">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[color-mix(in_srgb,var(--color-primary)_10%,transparent)] theme-primary-text">
                        <BriefcaseBusiness size={21} />
                      </div>
                      <div className="min-w-0">
                        <h2 className="font-semibold theme-text">
                          {kategori?.nama ?? "-"}
                        </h2>
                        <p className="mt-1 text-xs theme-text-muted">
                          Kode: {kategori?.kode || "-"}
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 rounded-lg border theme-border bg-[color-mix(in_srgb,var(--color-text)_3%,transparent)] p-4">
                      <p className="text-xs theme-text-muted">Tarif aktif</p>
                      <p className="mt-1 text-xl font-bold tabular-nums theme-text">
                        {currentTarif
                          ? formatRupiah(currentTarif.tarifPerJam)
                          : "Belum diatur"}
                      </p>
                      {currentTarif?.berlakuMulai && (
                        <p className="mt-1 text-xs theme-text-muted">
                          Sejak {formatTanggal(currentTarif.berlakuMulai)}
                        </p>
                      )}
                    </div>
                  </section>

                  <section className="theme-card rounded-xl border theme-border p-5 shadow-sm">
                    <div className="mb-3 flex items-center gap-2">
                      <History size={17} className="theme-text-muted" />
                      <h3 className="text-sm font-semibold theme-text">
                        Riwayat Tarif
                      </h3>
                    </div>

                    {riwayat.length === 0 ? (
                      <div className="rounded-lg border border-dashed theme-border p-4 text-center text-xs theme-text-muted">
                        Belum ada riwayat tarif.
                      </div>
                    ) : (
                      <ul className="max-h-72 space-y-2 overflow-y-auto pr-1">
                        {riwayat.map((tarif, index) => (
                          <li
                            key={tarif.id ?? `${tarif.berlakuMulai}-${index}`}
                            className="rounded-lg border theme-border p-3"
                          >
                            <div className="flex items-center justify-between gap-2">
                              <p className="text-sm font-semibold tabular-nums theme-text">
                                {formatRupiah(tarif.tarifPerJam)}
                              </p>
                              {!tarif.berakhirPada && (
                                <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300">
                                  Aktif
                                </span>
                              )}
                            </div>
                            <p className="mt-1 text-xs theme-text-muted">
                              {formatTanggal(tarif.berlakuMulai)}
                              {tarif.berakhirPada
                                ? ` – ${formatTanggal(tarif.berakhirPada)}`
                                : " – masih berlaku"}
                            </p>
                            {tarif.catatan && (
                              <p className="mt-1 text-xs theme-text-secondary">
                                {tarif.catatan}
                              </p>
                            )}
                          </li>
                        ))}
                      </ul>
                    )}
                  </section>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}