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
  "w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 disabled:cursor-not-allowed disabled:bg-slate-50 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:border-blue-500 dark:disabled:bg-slate-900";

const buttonSecondary =
  "inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800";

const buttonPrimary =
  "inline-flex items-center justify-center gap-2 rounded-xl bg-blue-700 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-50";

function StatusBadge({ status }) {
  const aktif = status === "aktif";

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold ${
        aktif
          ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:ring-emerald-800"
          : "bg-slate-100 text-slate-600 ring-1 ring-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:ring-slate-700"
      }`}
    >
      {aktif ? <CheckCircle2 size={14} /> : <XCircle size={14} />}
      {aktif ? "Aktif" : "Nonaktif"}
    </span>
  );
}

function InfoRow({ label, value, icon: Icon }) {
  return (
    <div className="flex items-start gap-3 border-b border-slate-100 py-3.5 last:border-b-0 dark:border-slate-800">
      {Icon && (
        <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
          <Icon size={16} />
        </div>
      )}
      <div className="min-w-0 flex-1">
        <p className="text-xs text-slate-500 dark:text-slate-400">{label}</p>
        <p className="mt-1 break-words text-sm font-medium text-slate-800 dark:text-slate-100">
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
    <div className="flex h-screen overflow-hidden bg-slate-50 dark:bg-slate-950">
      <Sidebar />

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <Header />

        <main className="min-h-0 flex-1 overflow-y-auto">
          <div className="mx-auto max-w-5xl space-y-6 px-4 py-6 sm:px-6 lg:px-8">
            {/* HEADER HALAMAN */}
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
              <div className="flex items-start gap-3">
                <button
                  type="button"
                  onClick={() =>
                    router.push("/admin/presensi/kategori-jabatan")
                  }
                  className="mt-1 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
                  aria-label="Kembali"
                >
                  <ArrowLeft size={17} />
                </button>

                <div className="flex items-start gap-3">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                    <BriefcaseBusiness size={23} />
                  </div>

                  <div>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      Presensi dan Kepegawaian
                    </p>
                    <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                      Detail Kategori Jabatan
                    </h1>
                    <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-500 dark:text-slate-400">
                      Informasi lengkap kategori, tarif aktif, dan riwayat
                      tarif yang tercatat di sistem.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => router.push("/admin/presensi/kategori-jabatan")}
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

            {/* NOTICE */}
            {notice && (
              <div className="flex items-start gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300">
                <CheckCircle2 size={18} className="mt-0.5 shrink-0" />
                <p className="min-w-0 flex-1">{notice}</p>
                <button
                  type="button"
                  onClick={() => setNotice("")}
                  className="rounded-md p-1"
                  aria-label="Tutup pemberitahuan"
                >
                  <X size={15} />
                </button>
              </div>
            )}

            {/* ERROR */}
            {error && (
              <div className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/30 dark:text-red-300">
                <AlertCircle size={18} className="mt-0.5 shrink-0" />
                <p className="min-w-0 flex-1">{error}</p>
                <button
                  type="button"
                  onClick={() => setError("")}
                  aria-label="Tutup pesan error"
                >
                  <X size={16} />
                </button>
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
                  Memuat detail kategori...
                </p>
              </div>
            ) : !item ? (
              <div className="flex min-h-[300px] flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white text-center dark:border-slate-800 dark:bg-slate-900">
                <AlertCircle size={30} className="text-red-500" />
                <p className="mt-3 font-semibold text-slate-900 dark:text-white">
                  Kategori tidak ditemukan
                </p>
                <p className="mt-1 max-w-md text-sm text-slate-500">
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
                {/* KARTU IDENTITAS */}
                <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
                  <div className="flex flex-col justify-between gap-3 border-b border-slate-200 p-5 dark:border-slate-800 sm:flex-row sm:items-start sm:p-6">
                    <div className="flex items-start gap-4">
                      <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300">
                        <BriefcaseBusiness size={24} />
                      </div>

                      <div className="min-w-0">
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                          {item.nama}
                        </h2>
                        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                          Kode: {item.kode || "-"}
                        </p>
                        {item.keterangan && (
                          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600 dark:text-slate-300">
                            {item.keterangan}
                          </p>
                        )}
                      </div>
                    </div>

                    <StatusBadge status={item.status} />
                  </div>

                  <div className="grid grid-cols-1 gap-4 p-5 sm:grid-cols-2 sm:p-6">
                    <div className="rounded-xl bg-slate-50 p-4 dark:bg-slate-950">
                      <div className="flex items-center gap-2">
                        <Wallet size={16} className="text-blue-600" />
                        <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                          Tarif aktif
                        </p>
                      </div>
                      <p className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">
                        {currentTarif
                          ? formatRupiah(currentTarif.tarifPerJam)
                          : "Belum diatur"}
                      </p>
                      {currentTarif?.berlakuMulai && (
                        <p className="mt-1 text-xs text-slate-500">
                          Berlaku sejak{" "}
                          {formatTanggal(currentTarif.berlakuMulai)}
                        </p>
                      )}
                    </div>

                    <div className="rounded-xl bg-slate-50 p-4 dark:bg-slate-950">
                      <div className="flex items-center gap-2">
                        <Users size={16} className="text-indigo-600" />
                        <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                          Jumlah pegawai
                        </p>
                      </div>
                      <p className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">
                        {Number(item.jumlahPengguna ?? 0)}
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        Pegawai terhubung dengan kategori ini
                      </p>
                    </div>
                  </div>
                </section>

                {/* INFORMASI DETAIL */}
                <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
                  <div className="border-b border-slate-200 p-5 dark:border-slate-800 sm:p-6">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300">
                        <Info size={19} />
                      </div>
                      <div>
                        <h2 className="font-semibold text-slate-900 dark:text-white">
                          Informasi Kategori
                        </h2>
                        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
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
                      value={item.status === "aktif" ? "Aktif" : "Nonaktif"}
                    />
                    <InfoRow
                      label="Keterangan"
                      value={item.keterangan || "Tidak ada keterangan."}
                    />
                  </div>
                </section>

                {/* RIWAYAT TARIF */}
                <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
                  <div className="flex flex-col justify-between gap-3 border-b border-slate-200 p-5 dark:border-slate-800 sm:flex-row sm:items-center sm:p-6">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300">
                        <History size={19} />
                      </div>
                      <div>
                        <h2 className="font-semibold text-slate-900 dark:text-white">
                          Riwayat Tarif
                        </h2>
                        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
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
                    <div className="border-b border-slate-200 bg-slate-50 p-5 dark:border-slate-800 dark:bg-slate-950/60 sm:p-6">
                      <form onSubmit={handleTarifSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                          <label className="block space-y-1.5">
                            <span className="text-sm font-medium text-slate-700 dark:text-slate-200">
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
                            <span className="text-sm font-medium text-slate-700 dark:text-slate-200">
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
                          <span className="text-sm font-medium text-slate-700 dark:text-slate-200">
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
                            {savingTarif ? "Menyimpan..." : "Simpan Tarif"}
                          </button>
                        </div>
                      </form>
                    </div>
                  )}

                  {/* TABEL RIWAYAT */}
                  <div className="p-5 sm:p-6">
                    {!item.tarifRiwayat?.length ? (
                      <div className="rounded-xl border border-dashed border-slate-300 p-8 text-center text-sm text-slate-500 dark:border-slate-700">
                        Belum ada riwayat tarif yang tersedia.
                      </div>
                    ) : (
                      <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
                        <table className="w-full min-w-[640px] text-left text-sm">
                          <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500 dark:bg-slate-950/70 dark:text-slate-400">
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
                          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                            {item.tarifRiwayat.map((tarif, index) => (
                              <tr
                                key={
                                  tarif.id ??
                                  `${tarif.berlakuMulai}-${index}`
                                }
                                className="transition hover:bg-slate-50/80 dark:hover:bg-slate-800/40"
                              >
                                <td className="px-4 py-3">
                                  <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-slate-100 text-[11px] font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                                    {index + 1}
                                  </span>
                                </td>
                                <td className="px-4 py-3 font-semibold text-slate-900 dark:text-white">
                                  {formatRupiah(tarif.tarifPerJam)}
                                </td>
                                <td className="px-4 py-3 text-slate-600 dark:text-slate-300">
                                  {formatTanggal(tarif.berlakuMulai)}
                                </td>
                                <td className="px-4 py-3 text-slate-600 dark:text-slate-300">
                                  {tarif.berakhirPada
                                    ? formatTanggal(tarif.berakhirPada)
                                    : "Masih berlaku"}
                                </td>
                                <td className="px-4 py-3 text-slate-600 dark:text-slate-300">
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

                {/* INFO */}
                <div className="flex items-start gap-2 rounded-xl border border-blue-100 bg-blue-50/70 p-4 text-sm text-blue-900 dark:border-blue-900/60 dark:bg-blue-950/30 dark:text-blue-200">
                  <Info size={18} className="mt-0.5 shrink-0" />
                  <p className="leading-6">
                    Perubahan tarif disimpan sebagai riwayat baru. Perhitungan
                    gaji tetap mengikuti aturan sistem dan riwayat tarif yang
                    berlaku pada periode penggajian.
                  </p>
                </div>
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}