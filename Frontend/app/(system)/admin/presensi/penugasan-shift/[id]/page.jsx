"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  BriefcaseBusiness,
  UserRound,
  Clock3,
  Save,
  LoaderCircle,
  AlertCircle,
  CheckCircle2,
  X,
  Mail,
  CalendarClock,
  Info,
} from "lucide-react";

import Header from "@/app/components/Header";
import Sidebar from "@/app/components/Sidebar";
import { apiFetch } from "@/lib/api";
import { getUsers } from "@/services/user.service";
import {
  getShiftKerja,
  assignUserShiftAndJabatan,
} from "@/services/shiftKerja.service";

const JABATAN_ENDPOINT = "/api/kategori-jabatan";

/* =========================================================
   HELPERS
========================================================= */

function unwrapResponse(response) {
  let result = response;

  for (let i = 0; i < 3; i++) {
    if (result && typeof result === "object" && "data" in result) {
      result = result.data;
    } else {
      break;
    }
  }

  return result;
}

function getArray(response) {
  const result = unwrapResponse(response);

  if (Array.isArray(result)) return result;
  if (Array.isArray(result?.items)) return result.items;
  if (Array.isArray(result?.data)) return result.data;
  if (Array.isArray(result?.users)) return result.users;
  if (Array.isArray(result?.pengguna)) return result.pengguna;
  if (Array.isArray(result?.kategoriJabatan)) return result.kategoriJabatan;

  return [];
}

function formatJam(value) {
  if (!value) return "-";

  const text = String(value);

  if (/^\d{1,2}:\d{2}/.test(text)) {
    const match = text.match(/^(\d{1,2}):(\d{2})/);
    return `${match[1].padStart(2, "0")}:${match[2]}`;
  }

  const date = new Date(text);

  if (!Number.isNaN(date.getTime())) {
    return date.toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  }

  return text;
}

function getErrorMessage(error) {
  return error instanceof Error
    ? error.message
    : "Terjadi kesalahan. Silakan coba lagi.";
}

const inputClass =
  "h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 disabled:cursor-not-allowed disabled:bg-slate-50 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:border-blue-500 dark:disabled:bg-slate-900";

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

/* =========================================================
   PAGE
========================================================= */

export default function AturShiftPegawaiPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id;

  const [pegawai, setPegawai] = useState(null);
  const [shiftList, setShiftList] = useState([]);
  const [jabatanList, setJabatanList] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const [form, setForm] = useState({
    shiftKerjaId: "",
    kategoriJabatanId: "",
  });

  /* =======================================================
     LOAD DATA
  ======================================================= */

  const loadData = useCallback(async () => {
    if (!id) return;

    setLoading(true);
    setError("");

    try {
      const [usersResponse, shiftResponse, jabatanResponse] =
        await Promise.all([
          getUsers({ page: 1, limit: 200 }),
          getShiftKerja({ page: 1, limit: 100, status: "aktif" }),
          apiFetch(JABATAN_ENDPOINT, { method: "GET" }),
        ]);

      const listPegawai = Array.isArray(usersResponse?.data)
        ? usersResponse.data
        : [];

      const foundPegawai = listPegawai.find(
        (item) => String(item.id) === String(id)
      );

      if (!foundPegawai) {
        throw new Error("Data pegawai tidak ditemukan.");
      }

      const shifts = Array.isArray(shiftResponse?.data)
        ? shiftResponse.data
        : [];

      const jabatanData = getArray(jabatanResponse);

      setPegawai(foundPegawai);
      setShiftList(shifts);
      setJabatanList(jabatanData);

      setForm({
        shiftKerjaId:
          foundPegawai?.shiftKerjaId != null
            ? String(foundPegawai.shiftKerjaId)
            : "",
        kategoriJabatanId:
          foundPegawai?.kategoriJabatanId != null
            ? String(foundPegawai.kategoriJabatanId)
            : "",
      });
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    if (!notice) return;
    const timeout = setTimeout(() => setNotice(""), 4000);
    return () => clearTimeout(timeout);
  }, [notice]);

  /* =======================================================
     SUBMIT
  ======================================================= */

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    if (!pegawai?.id) {
      setError("Pegawai tidak valid.");
      return;
    }

    if (!form.shiftKerjaId) {
      setError("Silakan pilih shift kerja.");
      return;
    }

    setSaving(true);

    try {
      await assignUserShiftAndJabatan({
        penggunaId: pegawai.id,
        shiftKerjaId: form.shiftKerjaId,
        ...(form.kategoriJabatanId
          ? { kategoriJabatanId: form.kategoriJabatanId }
          : {}),
      });

      // Simpan notice untuk ditampilkan di halaman list
      try {
        sessionStorage.setItem(
          "penugasan-notice",
          `Penugasan untuk ${
            pegawai.namaLengkap || "pegawai"
          } berhasil diperbarui.`
        );
      } catch {
        // ignore
      }

      router.push("/admin/presensi/penugasan-shift");
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  function handleBack() {
    if (saving) return;
    router.push("/admin/presensi/penugasan-shift");
  }

  /* =======================================================
     RENDER
  ======================================================= */

  const selectedShift = shiftList.find(
    (s) => String(s.id) === String(form.shiftKerjaId)
  );

  return (
    <div className="flex h-dvh w-full overflow-hidden bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <aside className="relative z-30 h-full shrink-0">
        <Sidebar role="admin_sekolah" />
      </aside>

      <div className="flex h-full min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
        <header className="relative z-20 flex h-16 shrink-0 items-center border-b border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
          <div className="w-full min-w-0">
            <Header />
          </div>
        </header>

        <main className="min-h-0 min-w-0 flex-1 overflow-y-auto overscroll-contain">
          <div className="mx-auto w-full max-w-4xl space-y-6 p-4 sm:p-6 lg:p-8">
            {/* PAGE TITLE */}
            <section className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
              <div className="flex items-start gap-3">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                  <BriefcaseBusiness size={23} />
                </div>

                <div>
                  <div className="mb-1 flex flex-wrap items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                    <span>Presensi</span>
                    <span>/</span>
                    <span>Penugasan Shift</span>
                    <span>/</span>
                    <span className="font-medium text-blue-700 dark:text-blue-400">
                      Atur Shift
                    </span>
                  </div>

                  <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                    Atur Penugasan Pegawai
                  </h1>

                  <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-500 dark:text-slate-400">
                    Tentukan shift kerja dan kategori jabatan untuk pegawai
                    berikut.
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
            </section>

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
                  aria-label="Tutup pesan error"
                >
                  <X size={16} />
                </button>
              </div>
            )}

            {notice && (
              <div
                role="status"
                className="flex items-start gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300"
              >
                <CheckCircle2 size={18} className="mt-0.5 shrink-0" />
                <p className="min-w-0 flex-1">{notice}</p>
              </div>
            )}

            {loading ? (
              <div className="flex min-h-[300px] flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
                <LoaderCircle
                  size={28}
                  className="animate-spin text-blue-600"
                />
                <p className="mt-3 text-sm text-slate-500">
                  Memuat data pegawai...
                </p>
              </div>
            ) : !pegawai ? (
              <div className="flex min-h-[300px] flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white text-center dark:border-slate-800 dark:bg-slate-900">
                <AlertCircle size={30} className="text-red-500" />
                <p className="mt-3 font-semibold text-slate-900 dark:text-white">
                  Pegawai tidak ditemukan
                </p>
                <button
                  type="button"
                  onClick={handleBack}
                  className={`${buttonPrimary} mt-4`}
                >
                  <ArrowLeft size={16} />
                  Kembali ke Daftar
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* INFO PEGAWAI */}
                <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
                  <div className="flex items-start gap-4 border-b border-slate-200 p-5 dark:border-slate-800 sm:p-6">
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300">
                      <UserRound size={24} />
                    </div>

                    <div className="min-w-0">
                      <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                        {pegawai.namaLengkap || "Tanpa nama"}
                      </h2>
                      <p className="mt-1 flex items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400">
                        <Mail size={14} />
                        {pegawai.email || "Email tidak tersedia"}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-4 p-5 sm:grid-cols-2 sm:p-6">
                    <div className="rounded-xl bg-slate-50 p-4 dark:bg-slate-950">
                      <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                        Shift saat ini
                      </p>
                      <p className="mt-2 text-sm font-semibold text-slate-900 dark:text-white">
                        {selectedShift?.nama || "Belum ditugaskan"}
                      </p>
                      {selectedShift && (
                        <p className="mt-1 flex items-center gap-1.5 text-xs text-slate-500">
                          <Clock3 size={12} />
                          {formatJam(selectedShift.jamMasuk)} –{" "}
                          {formatJam(selectedShift.jamKeluar)}
                        </p>
                      )}
                    </div>

                    <div className="rounded-xl bg-slate-50 p-4 dark:bg-slate-950">
                      <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                        Kategori jabatan
                      </p>
                      <p className="mt-2 text-sm font-semibold text-slate-900 dark:text-white">
                        {(() => {
                          const j =
                            pegawai.kategoriJabatan ??
                            jabatanList.find(
                              (item) =>
                                String(item.id) ===
                                String(form.kategoriJabatanId)
                            );

                          if (typeof j === "string") return j;

                          return (
                            j?.nama ??
                            j?.namaKategori ??
                            j?.namaJabatan ??
                            "Belum ditentukan"
                          );
                        })()}
                      </p>
                    </div>
                  </div>
                </section>

                {/* FORM PENUGASAN */}
                <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
                  <div className="flex items-start gap-3 border-b border-slate-200 p-5 dark:border-slate-800 sm:p-6">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300">
                      <CalendarClock size={19} />
                    </div>

                    <div>
                      <h2 className="font-semibold text-slate-900 dark:text-white">
                        Penugasan Shift & Jabatan
                      </h2>
                      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                        Pilih shift kerja aktif dan kategori jabatan pegawai.
                      </p>
                    </div>
                  </div>

                  <div className="space-y-5 p-5 sm:p-6">
                    <Field
                      label="Shift Kerja"
                      required
                      hint="Pilih shift aktif yang akan digunakan pada presensi pegawai."
                    >
                      <select
                        required
                        value={form.shiftKerjaId}
                        onChange={(e) =>
                          setForm((prev) => ({
                            ...prev,
                            shiftKerjaId: e.target.value,
                          }))
                        }
                        className={inputClass}
                        disabled={saving}
                      >
                        <option value="">Pilih shift kerja</option>
                        {shiftList.map((shift) => (
                          <option key={shift.id} value={String(shift.id)}>
                            {shift.nama} ({formatJam(shift.jamMasuk)}–
                            {formatJam(shift.jamKeluar)})
                          </option>
                        ))}
                      </select>
                    </Field>

                    <Field
                      label="Kategori Jabatan"
                      hint="Jika dibiarkan kosong, kategori jabatan sebelumnya tidak diubah."
                    >
                      <select
                        value={form.kategoriJabatanId}
                        onChange={(e) =>
                          setForm((prev) => ({
                            ...prev,
                            kategoriJabatanId: e.target.value,
                          }))
                        }
                        className={inputClass}
                        disabled={saving}
                      >
                        <option value="">
                          Tidak mengubah kategori jabatan
                        </option>
                        {jabatanList.map((jabatan) => (
                          <option key={jabatan.id} value={String(jabatan.id)}>
                            {jabatan.nama ??
                              jabatan.namaKategori ??
                              jabatan.namaJabatan ??
                              jabatan.id}
                          </option>
                        ))}
                      </select>
                    </Field>

                    <div className="flex items-start gap-2 rounded-xl border border-blue-100 bg-blue-50/70 p-4 text-sm text-blue-900 dark:border-blue-900/60 dark:bg-blue-950/30 dark:text-blue-200">
                      <Info size={18} className="mt-0.5 shrink-0" />
                      <p className="leading-6">
                        Perubahan penugasan akan langsung tersimpan pada data
                        pegawai dan digunakan pada proses presensi berikutnya.
                      </p>
                    </div>
                  </div>
                </section>

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
                    disabled={saving || shiftList.length === 0}
                    className={buttonPrimary}
                  >
                    {saving ? (
                      <LoaderCircle size={17} className="animate-spin" />
                    ) : (
                      <Save size={17} />
                    )}
                    {saving ? "Menyimpan..." : "Simpan Penugasan"}
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