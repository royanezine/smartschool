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
  BriefcaseBusiness,
  Wallet,
  Users,
  CheckCircle2,
  XCircle,
  History,
  LoaderCircle,
  AlertCircle,
  Pencil,
  Plus,
  X,
  Info,
} from "lucide-react";

/* =========================================================
   HELPERS
========================================================= */

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
    month: "long",
    year: "numeric",
  }).format(date);
}

function getErrorMessage(error) {
  return error instanceof Error
    ? error.message
    : "Terjadi kesalahan. Silakan coba kembali.";
}

/* =========================================================
   KOMPONEN
========================================================= */

const inputClass =
  "theme-input w-full rounded-xl border px-3.5 py-2.5 text-sm outline-none transition disabled:cursor-not-allowed disabled:opacity-60";

const buttonSecondary =
  "inline-flex items-center justify-center gap-2 rounded-xl border theme-border theme-card px-4 py-2.5 text-sm font-medium theme-text-secondary hover:bg-[color-mix(in_srgb,var(--color-text)_3%,transparent)] disabled:cursor-not-allowed disabled:opacity-50 transition";

const buttonPrimary =
  "inline-flex items-center justify-center gap-2 rounded-xl theme-primary px-4 py-2.5 text-sm font-semibold text-white hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50 transition";

function StatusBadge({ status }) {
  const aktif = status === "aktif";

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold ${
        aktif
          ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:ring-emerald-900/60"
          : "bg-[color-mix(in_srgb,var(--color-text)_6%,transparent)] theme-text-muted ring-1 ring-[color-mix(in_srgb,var(--color-text)_8%,transparent)]"
      }`}
    >
      {aktif ? <CheckCircle2 size={14} /> : <XCircle size={14} />}
      {aktif ? "Aktif" : "Nonaktif"}
    </span>
  );
}

function InfoRow({ label, value, icon: Icon }) {
  return (
    <div className="flex items-start gap-3 border-b theme-border py-3.5 last:border-b-0">
      {Icon && (
        <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[color-mix(in_srgb,var(--color-text)_6%,transparent)] theme-text-secondary">
          <Icon size={16} />
        </div>
      )}
      <div className="min-w-0 flex-1">
        <p className="text-xs theme-text-muted">{label}</p>
        <p className="mt-1 break-words text-sm font-medium theme-text">
          {value}
        </p>
      </div>
    </div>
  );
}

/* =========================================================
   HALAMAN DETAIL
========================================================= */

export default function DetailKategoriJabatanPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id;

  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  // Form tambah tarif (inline, bukan modal)
  const [showTarifForm, setShowTarifForm] = useState(false);
  const [tarifForm, setTarifForm] = useState({
    tarifPerJam: "",
    berlakuMulai: new Date().toISOString().slice(0, 10),
    catatan: "",
  });
  const [savingTarif, setSavingTarif] = useState(false);

  const loadDetail = useCallback(async () => {
    if (!id) return;

    setLoading(true);
    setError("");

    try {
      const result = await getKategoriJabatanById(id);
      setItem(result);
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

  function updateTarifForm(field, value) {
    setTarifForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleTarifSubmit(event) {
    event.preventDefault();
    setError("");

    const tarif = Number(tarifForm.tarifPerJam);

    if (
      tarifForm.tarifPerJam === "" ||
      !Number.isFinite(tarif) ||
      tarif < 0
    ) {
      setError("Tarif per jam wajib berupa angka minimal 0.");
      return;
    }

    if (!tarifForm.berlakuMulai) {
      setError("Tanggal mulai berlaku wajib diisi.");
      return;
    }

    setSavingTarif(true);

    try {
      await tambahTarifKategoriJabatan(id, {
        tarifPerJam: tarif,
        berlakuMulai: tarifForm.berlakuMulai,
        catatan: tarifForm.catatan.trim() || undefined,
      });

      setNotice("Tarif baru berhasil disimpan.");
      setShowTarifForm(false);
      setTarifForm({
        tarifPerJam: "",
        berlakuMulai: new Date().toISOString().slice(0, 10),
        catatan: "",
      });

      await loadDetail();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSavingTarif(false);
    }
  }

  const currentTarif = item?.tarifAktif;

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
                  <button
                    type="button"
                    onClick={() =>
                      router.push("/admin/presensi/kategori-jabatan")
                    }
                    className="mt-1 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border theme-border theme-card theme-text-secondary hover:bg-[color-mix(in_srgb,var(--color-text)_3%,transparent)] transition"
                    aria-label="Kembali"
                  >
                    <ArrowLeft size={17} />
                  </button>

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
                        <span>Detail</span>
                      </div>
                      <h1 className="mt-1 text-2xl font-bold tracking-tight theme-text">
                        Detail Kategori Jabatan
                      </h1>
                      <p className="mt-1 max-w-2xl text-sm leading-6 theme-text-secondary">
                        Informasi lengkap kategori, tarif aktif, dan riwayat
                        tarif yang tercatat di sistem.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      router.push("/admin/presensi/kategori-jabatan")
                    }
                    className={buttonSecondary}
                  >
                    <ArrowLeft size={16} />
                    Kembali
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      router.push(
                        `/admin/presensi/kategori-jabatan/${id}/edit`
                      )
                    }
                    className={buttonPrimary}
                  >
                    <Pencil size={16} />
                    Edit Kategori
                  </button>
                </div>
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
                  <button
                    type="button"
                    onClick={() => setNotice("")}
                    className="rounded p-1 hover:bg-emerald-100 dark:hover:bg-emerald-900/40"
                    aria-label="Tutup pemberitahuan"
                  >
                    <X size={16} />
                  </button>
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

              {/* ============================================
                  LOADING / NOT FOUND / DETAIL
              ============================================ */}
              {loading ? (
                <div className="flex min-h-[300px] flex-col items-center justify-center gap-3 theme-card rounded-xl border theme-border">
                  <LoaderCircle
                    size={28}
                    className="animate-spin theme-primary-text"
                  />
                  <p className="text-sm font-medium theme-text">
                    Memuat detail kategori...
                  </p>
                  <p className="text-xs theme-text-muted">
                    Mengambil data dari sistem
                  </p>
                </div>
              ) : !item ? (
                <div className="flex min-h-[300px] flex-col items-center justify-center theme-card rounded-xl border theme-border p-6 text-center">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-50 text-red-600 dark:bg-red-950/50 dark:text-red-400">
                    <AlertCircle size={23} />
                  </div>
                  <p className="mt-4 font-semibold theme-text">
                    Kategori tidak ditemukan
                  </p>
                  <p className="mt-1 max-w-md text-sm theme-text-muted">
                    Data kategori jabatan tidak ditemukan atau sudah dihapus.
                  </p>
                  <button
                    type="button"
                    onClick={() =>
                      router.push("/admin/presensi/kategori-jabatan")
                    }
                    className={`${buttonPrimary} mt-4`}
                  >
                    <ArrowLeft size={16} />
                    Kembali ke Daftar
                  </button>
                </div>
              ) : (
                <>
                  {/* ============================================
                      KARTU IDENTITAS
                  ============================================ */}
                  <section className="theme-card overflow-hidden rounded-xl border theme-border shadow-sm">
                    <div className="flex flex-col justify-between gap-3 border-b theme-border p-5 sm:flex-row sm:items-start sm:p-6">
                      <div className="flex items-start gap-4">
                        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[color-mix(in_srgb,var(--color-primary)_10%,transparent)] theme-primary-text">
                          <BriefcaseBusiness size={24} />
                        </div>

                        <div className="min-w-0">
                          <h2 className="text-xl font-bold theme-text">
                            {item.nama}
                          </h2>
                          <p className="mt-1 text-sm theme-text-muted">
                            Kode: {item.kode || "-"}
                          </p>
                          {item.keterangan && (
                            <p className="mt-3 max-w-2xl text-sm leading-6 theme-text-secondary">
                              {item.keterangan}
                            </p>
                          )}
                        </div>
                      </div>

                      <StatusBadge status={item.status} />
                    </div>

                    <div className="grid grid-cols-1 gap-4 p-5 sm:grid-cols-2 sm:p-6">
                      <div className="rounded-lg bg-[color-mix(in_srgb,var(--color-text)_3%,transparent)] border theme-border p-4">
                        <div className="flex items-center gap-2">
                          <Wallet size={16} className="theme-primary-text" />
                          <p className="text-xs font-medium theme-text-muted">
                            Tarif aktif
                          </p>
                        </div>
                        <p className="mt-2 text-2xl font-bold tabular-nums theme-text">
                          {currentTarif
                            ? formatRupiah(currentTarif.tarifPerJam)
                            : "Belum diatur"}
                        </p>
                        {currentTarif?.berlakuMulai && (
                          <p className="mt-1 text-xs theme-text-muted">
                            Berlaku sejak{" "}
                            {formatTanggal(currentTarif.berlakuMulai)}
                          </p>
                        )}
                      </div>

                      <div className="rounded-lg bg-[color-mix(in_srgb,var(--color-text)_3%,transparent)] border theme-border p-4">
                        <div className="flex items-center gap-2">
                          <Users size={16} className="text-indigo-600 dark:text-indigo-400" />
                          <p className="text-xs font-medium theme-text-muted">
                            Jumlah pegawai
                          </p>
                        </div>
                        <p className="mt-2 text-2xl font-bold tabular-nums theme-text">
                          {Number(item.jumlahPengguna ?? 0)}
                        </p>
                        <p className="mt-1 text-xs theme-text-muted">
                          Pegawai terhubung dengan kategori ini
                        </p>
                      </div>
                    </div>
                  </section>

                  {/* ============================================
                      INFORMASI DETAIL
                  ============================================ */}
                  <section className="theme-card overflow-hidden rounded-xl border theme-border shadow-sm">
                    <div className="border-b theme-border p-5 sm:p-6">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[color-mix(in_srgb,var(--color-primary)_10%,transparent)] theme-primary-text">
                          <Info size={19} />
                        </div>
                        <div>
                          <h2 className="font-semibold theme-text">
                            Informasi Kategori
                          </h2>
                          <p className="mt-1 text-sm theme-text-muted">
                            Detail identitas kategori jabatan.
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="p-5 sm:p-6">
                      <InfoRow
                        label="Nama kategori"
                        value={item.nama || "-"}
                        icon={BriefcaseBusiness}
                      />
                      <InfoRow
                        label="Kode kategori"
                        value={item.kode || "-"}
                      />
                      <InfoRow
                        label="Status"
                        value={
                          item.status === "aktif" ? "Aktif" : "Nonaktif"
                        }
                      />
                      <InfoRow
                        label="Keterangan"
                        value={item.keterangan || "Tidak ada keterangan."}
                      />
                    </div>
                  </section>

                  {/* ============================================
                      RIWAYAT TARIF
                  ============================================ */}
                  <section className="theme-card overflow-hidden rounded-xl border theme-border shadow-sm">
                    <div className="flex flex-col justify-between gap-3 border-b theme-border p-5 sm:flex-row sm:items-center sm:p-6">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300">
                          <History size={19} />
                        </div>
                        <div>
                          <h2 className="font-semibold theme-text">
                            Riwayat Tarif
                          </h2>
                          <p className="mt-1 text-sm theme-text-muted">
                            Semua perubahan tarif yang pernah tercatat.
                          </p>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => setShowTarifForm((v) => !v)}
                        className={buttonPrimary}
                      >
                        <Plus size={16} />
                        {showTarifForm ? "Tutup Form" : "Tambah Tarif"}
                      </button>
                    </div>

                    {/* FORM TAMBAH TARIF INLINE */}
                    {showTarifForm && (
                      <div className="border-b theme-border bg-[color-mix(in_srgb,var(--color-text)_3%,transparent)] p-5 sm:p-6">
                        <form
                          onSubmit={handleTarifSubmit}
                          className="space-y-4"
                        >
                          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <label className="block space-y-1.5">
                              <span className="text-sm font-medium theme-text">
                                Tarif baru per jam (Rp)
                                <span className="ml-1 text-red-500">*</span>
                              </span>
                              <input
                                required
                                type="number"
                                min="0"
                                step="1"
                                value={tarifForm.tarifPerJam}
                                onChange={(e) =>
                                  updateTarifForm(
                                    "tarifPerJam",
                                    e.target.value
                                  )
                                }
                                placeholder="Masukkan tarif baru"
                                className={inputClass}
                                disabled={savingTarif}
                              />
                            </label>

                            <label className="block space-y-1.5">
                              <span className="text-sm font-medium theme-text">
                                Berlaku mulai
                                <span className="ml-1 text-red-500">*</span>
                              </span>
                              <input
                                required
                                type="date"
                                value={tarifForm.berlakuMulai}
                                onChange={(e) =>
                                  updateTarifForm(
                                    "berlakuMulai",
                                    e.target.value
                                  )
                                }
                                className={inputClass}
                                disabled={savingTarif}
                              />
                            </label>
                          </div>

                          <label className="block space-y-1.5">
                            <span className="text-sm font-medium theme-text">
                              Catatan perubahan
                            </span>
                            <textarea
                              rows={3}
                              value={tarifForm.catatan}
                              onChange={(e) =>
                                updateTarifForm("catatan", e.target.value)
                              }
                              placeholder="Contoh: penyesuaian tarif periode baru"
                              className={inputClass}
                              disabled={savingTarif}
                            />
                          </label>

                          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                            <button
                              type="button"
                              onClick={() => setShowTarifForm(false)}
                              disabled={savingTarif}
                              className={buttonSecondary}
                            >
                              Batal
                            </button>

                            <button
                              type="submit"
                              disabled={savingTarif}
                              className={buttonPrimary}
                            >
                              {savingTarif ? (
                                <LoaderCircle
                                  size={16}
                                  className="animate-spin"
                                />
                              ) : (
                                <Wallet size={16} />
                              )}
                              {savingTarif
                                ? "Menyimpan..."
                                : "Simpan Tarif"}
                            </button>
                          </div>
                        </form>
                      </div>
                    )}

                    {/* TABEL RIWAYAT */}
                    <div className="p-5 sm:p-6">
                      {!item.tarifRiwayat?.length ? (
                        <div className="rounded-lg border border-dashed theme-border p-8 text-center text-sm theme-text-muted">
                          Belum ada riwayat tarif yang tersedia.
                        </div>
                      ) : (
                        <div className="overflow-x-auto rounded-lg border theme-border">
                          <table className="w-full min-w-[640px] text-left text-sm">
                            <thead className="bg-[color-mix(in_srgb,var(--color-text)_3%,transparent)] text-xs uppercase tracking-wide theme-text-muted border-b theme-border">
                              <tr>
                                <th className="w-14 px-4 py-3 font-semibold">
                                  No
                                </th>
                                <th className="px-4 py-3 font-semibold">
                                  Tarif per jam
                                </th>
                                <th className="px-4 py-3 font-semibold">
                                  Mulai berlaku
                                </th>
                                <th className="px-4 py-3 font-semibold">
                                  Berakhir
                                </th>
                                <th className="px-4 py-3 font-semibold">
                                  Catatan
                                </th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-[color-mix(in_srgb,var(--color-text)_5%,transparent)]">
                              {item.tarifRiwayat.map((tarif, index) => (
                                <tr
                                  key={
                                    tarif.id ??
                                    `${tarif.berlakuMulai}-${index}`
                                  }
                                  className="hover:bg-[color-mix(in_srgb,var(--color-text)_2%,transparent)] transition"
                                >
                                  <td className="px-4 py-3">
                                    <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-[color-mix(in_srgb,var(--color-text)_6%,transparent)] text-[11px] font-semibold theme-text-secondary">
                                      {index + 1}
                                    </span>
                                  </td>
                                  <td className="px-4 py-3 font-semibold tabular-nums theme-text">
                                    {formatRupiah(tarif.tarifPerJam)}
                                  </td>
                                  <td className="px-4 py-3 theme-text-secondary">
                                    {formatTanggal(tarif.berlakuMulai)}
                                  </td>
                                  <td className="px-4 py-3 theme-text-secondary">
                                    {tarif.berakhirPada
                                      ? formatTanggal(tarif.berakhirPada)
                                      : "Masih berlaku"}
                                  </td>
                                  <td className="px-4 py-3 theme-text-secondary">
                                    {tarif.catatan || "-"}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  </section>

                  {/* ============================================
                      INFO
                  ============================================ */}
                  <div className="flex items-start gap-2 rounded-lg border border-blue-200 bg-blue-50/70 p-4 text-sm text-blue-900 dark:border-blue-900/60 dark:bg-blue-950/30 dark:text-blue-200">
                    <Info size={18} className="mt-0.5 shrink-0" />
                    <p className="leading-6">
                      Perubahan tarif disimpan sebagai riwayat baru.
                      Perhitungan gaji mengikuti aturan sistem dan riwayat
                      tarif yang berlaku pada periode penggajian.
                    </p>
                  </div>
                </>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}