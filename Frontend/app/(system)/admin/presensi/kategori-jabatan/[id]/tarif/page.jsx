"use client";

import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import Header from "@/app/components/Header";
import Sidebar from "@/app/components/Sidebar";

import {
  getKategoriJabatanById,
  tambahTarifKategoriJabatan,
} from "@/services/kategoriJabatan.service";

import {
  AlertCircle,
  ArrowLeft,
  BriefcaseBusiness,
  CalendarDays,
  CheckCircle2,
  History,
  Info,
  LoaderCircle,
  Wallet,
  X,
  XCircle,
} from "lucide-react";

const inputClass =
  "theme-input w-full rounded-xl border px-3.5 py-2.5 text-sm outline-none transition disabled:cursor-not-allowed disabled:opacity-50";

const buttonSecondary =
  "inline-flex items-center justify-center gap-2 rounded-xl border theme-border theme-card px-3.5 py-2.5 text-sm font-medium theme-text-secondary hover:bg-[color-mix(in_srgb,var(--color-text)_3%,transparent)] disabled:cursor-not-allowed disabled:opacity-50 transition";

const buttonPrimary =
  "inline-flex items-center justify-center gap-2 rounded-xl theme-primary px-4 py-2.5 text-sm font-semibold text-white hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50 transition";

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

function Field({ label, required, hint, children }) {
  return (
    <label className="block space-y-1.5">
      <span className="text-sm font-medium theme-text">
        {label}
        {required && <span className="ml-1 text-red-500">*</span>}
      </span>
      {children}
      {hint && (
        <span className="block text-xs theme-text-muted">{hint}</span>
      )}
    </label>
  );
}

function StatusBadge({ status }) {
  const aktif = status === "aktif";

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${
        aktif
          ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:ring-emerald-900/60"
          : "bg-[color-mix(in_srgb,var(--color-text)_6%,transparent)] theme-text-muted ring-1 ring-[color-mix(in_srgb,var(--color-text)_8%,transparent)]"
      }`}
    >
      {aktif ? <CheckCircle2 size={13} /> : <XCircle size={13} />}
      {aktif ? "Aktif" : "Nonaktif"}
    </span>
  );
}

export default function TambahTarifKategoriJabatanPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id;

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [selected, setSelected] = useState(null);

  const [form, setForm] = useState({
    tarifPerJam: "",
    berlakuMulai: new Date().toISOString().slice(0, 10),
    catatan: "",
  });

  const loadDetail = useCallback(async () => {
    if (!id) return;

    setLoading(true);
    setError("");

    try {
      const data = await getKategoriJabatanById(id);
      if (!data) {
        setError("Kategori jabatan tidak ditemukan.");
        return;
      }
      setSelected(data);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadDetail();
  }, [loadDetail]);

  function updateForm(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    const tarif = Number(form.tarifPerJam);

    if (form.tarifPerJam === "" || !Number.isFinite(tarif) || tarif < 0) {
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

      router.push(`/admin/presensi/kategori-jabatan/${id}`);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  const currentTarif = selected?.tarifAktif;

  const riwayatSingkat = useMemo(() => {
    const list = Array.isArray(selected?.tarifRiwayat)
      ? selected.tarifRiwayat
      : [];
    return list.slice(0, 4);
  }, [selected]);

  const selisihTarif = useMemo(() => {
    const lama = Number(currentTarif?.tarifPerJam ?? 0);
    const baru = Number(form.tarifPerJam);

    if (
      !form.tarifPerJam ||
      !Number.isFinite(baru) ||
      !Number.isFinite(lama) ||
      lama === 0
    ) {
      return null;
    }

    const diff = baru - lama;
    const persen = Math.round((diff / lama) * 100);

    return { diff, persen };
  }, [currentTarif, form.tarifPerJam]);

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

        <main className="theme-page min-h-0 min-w-0 flex-1 overflow-y-auto">
          <div className="w-full px-4 py-5 sm:px-6 sm:py-6 lg:px-8 lg:py-8 2xl:px-12">
            <div className="w-full space-y-6">
              <div className="flex items-start gap-3">
                <button
                  type="button"
                  onClick={() => router.back()}
                  className="mt-1 rounded-lg p-2 theme-text-muted hover:bg-[color-mix(in_srgb,var(--color-text)_5%,transparent)]"
                  aria-label="Kembali"
                >
                  <ArrowLeft size={20} />
                </button>

                <div className="min-w-0">
                  <h1 className="text-2xl font-bold tracking-tight theme-text">
                    Atur Tarif Jabatan
                  </h1>
                  <p className="mt-1 text-sm theme-text-secondary">
                    {selected
                      ? `Tambahkan tarif baru untuk kategori ${selected.nama}.`
                      : "Memuat kategori..."}
                  </p>
                </div>
              </div>

              {loading ? (
                <div className="theme-card flex min-h-64 flex-col items-center justify-center rounded-2xl border theme-border px-4 text-center shadow-sm">
                  <LoaderCircle
                    size={28}
                    className="animate-spin theme-primary-text"
                  />
                  <p className="mt-3 text-sm font-medium theme-text">
                    Memuat data kategori...
                  </p>
                  <p className="mt-1 text-xs theme-text-muted">
                    Mengambil dari sistem
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 items-start gap-5 xl:grid-cols-[minmax(0,1fr)_380px] 2xl:grid-cols-[minmax(0,1fr)_440px]">
                  <section className="theme-card min-w-0 overflow-hidden rounded-2xl border theme-border shadow-sm">
                    <div className="border-b theme-border px-5 py-4 sm:px-6">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[color-mix(in_srgb,var(--color-primary)_10%,transparent)] theme-primary-text">
                          <Wallet size={18} />
                        </div>
                        <div className="min-w-0">
                          <h2 className="text-base font-semibold theme-text">
                            Formulir Tarif Baru
                          </h2>
                          <p className="mt-0.5 text-xs theme-text-muted">
                            Riwayat tarif lama tetap tersimpan
                          </p>
                        </div>
                      </div>
                    </div>

                    <form
                      onSubmit={handleSubmit}
                      className="space-y-5 p-5 sm:p-6"
                    >
                      {error && (
                        <div className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900/60 dark:bg-red-950/30 dark:text-red-300">
                          <AlertCircle size={17} className="mt-0.5 shrink-0" />
                          <span className="flex-1">{error}</span>
                          <button
                            type="button"
                            onClick={() => setError("")}
                            aria-label="Tutup"
                            className="rounded p-1"
                          >
                            <X size={14} />
                          </button>
                        </div>
                      )}

                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <Field
                          label="Tarif baru per jam (Rp)"
                          required
                          hint="Angka minimal 0, tanpa titik/koma."
                        >
                          <input
                            required
                            type="number"
                            min="0"
                            step="1"
                            value={form.tarifPerJam}
                            onChange={(event) =>
                              updateForm("tarifPerJam", event.target.value)
                            }
                            placeholder="Contoh: 30000"
                            className={inputClass}
                          />
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
                          />
                        </Field>
                      </div>

                      {selisihTarif && (
                        <div
                          className={`rounded-xl border p-3 text-xs ${
                            selisihTarif.diff > 0
                              ? "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-950/30 dark:text-emerald-300"
                              : selisihTarif.diff < 0
                                ? "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900/60 dark:bg-amber-950/30 dark:text-amber-300"
                                : "border-[color-mix(in_srgb,var(--color-text)_10%,transparent)] bg-[color-mix(in_srgb,var(--color-text)_3%,transparent)] theme-text-secondary"
                          }`}
                        >
                          {selisihTarif.diff === 0
                            ? "Tarif sama dengan tarif aktif saat ini."
                            : `Selisih ${selisihTarif.diff > 0 ? "+" : ""}${formatRupiah(selisihTarif.diff)} (${selisihTarif.persen > 0 ? "+" : ""}${selisihTarif.persen}%) dari tarif aktif.`}
                        </div>
                      )}

                      <Field
                        label="Catatan perubahan"
                        hint="Opsional — misalnya alasan penyesuaian tarif."
                      >
                        <textarea
                          rows={4}
                          value={form.catatan}
                          onChange={(event) =>
                            updateForm("catatan", event.target.value)
                          }
                          placeholder="Contoh: penyesuaian tarif periode 2025/2026"
                          className={inputClass}
                        />
                      </Field>

                      <div className="flex items-start gap-2 rounded-xl border theme-border bg-[color-mix(in_srgb,var(--color-text)_3%,transparent)] p-3">
                        <Info
                          size={16}
                          className="mt-0.5 shrink-0 theme-text-muted"
                        />
                        <p className="text-xs leading-5 theme-text-muted">
                          Sistem otomatis menutup tarif sebelumnya dan membuat
                          riwayat tarif baru. Gaji pegawai mengikuti tarif yang
                          berlaku pada periode penggajian.
                        </p>
                      </div>

                      <div className="flex flex-col-reverse gap-2 border-t theme-border pt-4 sm:flex-row sm:justify-end">
                        <button
                          type="button"
                          onClick={() => router.back()}
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
                            <LoaderCircle size={16} className="animate-spin" />
                          ) : (
                            <Wallet size={16} />
                          )}
                          {saving ? "Menyimpan..." : "Simpan Tarif"}
                        </button>
                      </div>
                    </form>
                  </section>

                  <aside className="min-w-0 space-y-4 xl:sticky xl:top-6">
                    <div className="theme-card rounded-2xl border theme-border p-5 shadow-sm">
                      <div className="flex items-start gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[color-mix(in_srgb,var(--color-primary)_10%,transparent)] theme-primary-text">
                          <BriefcaseBusiness size={18} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-[11px] font-semibold uppercase tracking-wider theme-text-muted">
                            Kategori Jabatan
                          </p>
                          <p className="mt-1 break-words text-sm font-bold theme-text">
                            {selected?.nama || "-"}
                          </p>
                          <p className="mt-0.5 text-xs theme-text-muted">
                            Kode: {selected?.kode || "-"}
                          </p>
                        </div>
                      </div>

                      <div className="mt-4 flex flex-wrap items-center gap-2">
                        <StatusBadge status={selected?.status} />
                        {selected?.jumlahPengguna != null && (
                          <span className="inline-flex items-center gap-1.5 rounded-full border theme-border px-2.5 py-1 text-xs font-medium theme-text-secondary">
                            <BriefcaseBusiness size={12} />
                            {Number(selected.jumlahPengguna)} pegawai
                          </span>
                        )}
                      </div>

                      {selected?.keterangan && (
                        <p className="mt-3 border-t theme-border pt-3 text-xs leading-5 theme-text-muted">
                          {selected.keterangan}
                        </p>
                      )}
                    </div>

                    <div className="theme-card rounded-2xl border theme-border p-5 shadow-sm">
                      <p className="text-[11px] font-semibold uppercase tracking-wider theme-text-muted">
                        Tarif Aktif Saat Ini
                      </p>

                      <p className="mt-2 text-2xl font-bold tabular-nums theme-text">
                        {currentTarif
                          ? formatRupiah(currentTarif.tarifPerJam)
                          : "Belum diatur"}
                      </p>

                      {currentTarif?.berlakuMulai && (
                        <p className="mt-1 flex items-center gap-1.5 text-xs theme-text-muted">
                          <CalendarDays size={12} />
                          Sejak {formatTanggal(currentTarif.berlakuMulai)}
                        </p>
                      )}

                      {currentTarif?.catatan && (
                        <p className="mt-3 rounded-lg border theme-border bg-[color-mix(in_srgb,var(--color-text)_3%,transparent)] p-2.5 text-xs theme-text-secondary">
                          {currentTarif.catatan}
                        </p>
                      )}
                    </div>

                    <div className="theme-card rounded-2xl border theme-border p-5 shadow-sm">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-[11px] font-semibold uppercase tracking-wider theme-text-muted">
                          Riwayat Terbaru
                        </p>
                        <History size={14} className="theme-text-muted" />
                      </div>

                      {riwayatSingkat.length === 0 ? (
                        <p className="mt-3 rounded-lg border border-dashed theme-border p-3 text-center text-xs theme-text-muted">
                          Belum ada riwayat tarif.
                        </p>
                      ) : (
                        <ul className="mt-3 space-y-2">
                          {riwayatSingkat.map((tarif, index) => {
                            const berakhir = tarif.berakhirPada;

                            return (
                              <li
                                key={
                                  tarif.id ?? `${tarif.berlakuMulai}-${index}`
                                }
                                className="rounded-lg border theme-border bg-[color-mix(in_srgb,var(--color-text)_3%,transparent)] p-2.5"
                              >
                                <div className="flex items-center justify-between gap-2">
                                  <p className="text-sm font-semibold tabular-nums theme-text">
                                    {formatRupiah(tarif.tarifPerJam)}
                                  </p>
                                  {!berakhir && (
                                    <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 ring-1 ring-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:ring-emerald-900/60">
                                      Aktif
                                    </span>
                                  )}
                                </div>
                                <p className="mt-0.5 text-[11px] theme-text-muted">
                                  {formatTanggal(tarif.berlakuMulai)}
                                  {berakhir
                                    ? ` – ${formatTanggal(berakhir)}`
                                    : " – sekarang"}
                                </p>
                              </li>
                            );
                          })}
                        </ul>
                      )}
                    </div>
                  </aside>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}