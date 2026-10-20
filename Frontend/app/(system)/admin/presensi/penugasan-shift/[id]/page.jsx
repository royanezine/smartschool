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
  RefreshCw,
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
const CACHE_KEY = "smartschool-penugasan-shift-cache";

function getArray(response, keys = []) {
  let current = response;

  for (let i = 0; i < 6 && current != null; i++) {
    if (Array.isArray(current)) return current;

    if (typeof current !== "object") return [];

    for (const key of keys) {
      if (Array.isArray(current[key])) return current[key];
    }

    if (Array.isArray(current.items)) return current.items;

    if (!("data" in current)) return [];
    current = current.data;
  }

  return Array.isArray(current) ? current : [];
}

function getId(value) {
  return value == null ? "" : String(value);
}

function getCache() {
  try {
    const parsed = JSON.parse(
      localStorage.getItem(CACHE_KEY) || "{}"
    );
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

function saveCache(id, assignment) {
  try {
    const cache = getCache();

    cache[getId(id)] = {
      ...(cache[getId(id)] || {}),
      ...assignment,
      updatedAt: new Date().toISOString(),
    };

    localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
  } catch {
    // Cache hanya untuk membantu tampilan FE; bukan penyimpanan utama.
  }
}

function getNamaJabatan(value) {
  if (typeof value === "string") return value;

  return (
    value?.nama ??
    value?.namaKategori ??
    value?.namaJabatan ??
    value?.namaKategoriJabatan ??
    ""
  );
}

function getNamaShift(pegawai, shiftList, cached) {
  const relation =
    pegawai?.shiftKerjaMaster ??
    (typeof pegawai?.shiftKerja === "object"
      ? pegawai.shiftKerja
      : null);

  const id = pegawai?.shiftKerjaId ?? relation?.id;

  if (id) {
    const found = shiftList.find((x) => getId(x.id) === getId(id));
    if (found) return found;
    if (relation?.nama) return relation.nama;
  }

  if (cached?.shiftKerjaId) {
    const found = shiftList.find(
      (x) => getId(x.id) === getId(cached.shiftKerjaId)
    );
    if (found) return found;
  }

  if (typeof pegawai?.shiftKerja === "string" && pegawai.shiftKerja.trim()) {
    const legacy = pegawai.shiftKerja.trim();
    const found = shiftList.find((shift) => {
      const value = legacy.toLowerCase();
      return (
        String(shift.nama ?? "").trim().toLowerCase() === value ||
        String(shift.kode ?? "").trim().toLowerCase() === value
      );
    });

    return found?.nama || legacy;
  }

  return "";
}

function formatJam(value) {
  if (!value) return "-";

  const text = String(value);
  const match = text.match(/^(\d{1,2}):(\d{2})/);

  if (match) {
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

/* =========================================================
   STYLE HELPERS — pakai token tema
========================================================= */

const inputClass =
  "theme-input h-11 w-full rounded-xl border px-3.5 text-sm outline-none transition disabled:opacity-50";

const buttonSecondary =
  "inline-flex items-center justify-center gap-2 rounded-xl border theme-border theme-card px-4 py-2.5 text-sm font-medium theme-text-secondary hover:bg-[color-mix(in_srgb,var(--color-text)_3%,transparent)] disabled:cursor-not-allowed disabled:opacity-50 transition";

const buttonPrimary =
  "inline-flex items-center justify-center gap-2 rounded-xl theme-primary px-4 py-2.5 text-sm font-semibold text-white hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50 transition";

function Field({ label, required, hint, error, children }) {
  return (
    <label className="block space-y-1.5">
      <span className="text-sm font-medium theme-text">
        {label}
        {required && <span className="ml-1 text-red-500">*</span>}
      </span>
      {children}
      {error ? (
        <span className="block text-xs leading-5 text-red-600 dark:text-red-400">
          {error}
        </span>
      ) : (
        hint && (
          <span className="block text-xs leading-5 theme-text-muted">
            {hint}
          </span>
        )
      )}
    </label>
  );
}

export default function AturShiftPegawaiPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id;

  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [pegawai, setPegawai] = useState(null);
  const [shiftList, setShiftList] = useState([]);
  const [jabatanList, setJabatanList] = useState([]);
  const [cache, setCache] = useState({});

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    shiftKerjaId: "",
    kategoriJabatanId: "",
  });

  const loadData = useCallback(async () => {
    if (!id) {
      setLoading(false);
      setError("ID pegawai tidak ditemukan pada URL.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const [usersResponse, shiftsResponse, jabatanResponse] =
        await Promise.all([
          getUsers({ page: 1, limit: 200 }),
          getShiftKerja({
            page: 1,
            limit: 100,
            status: "aktif",
          }),
          apiFetch(JABATAN_ENDPOINT, { method: "GET" }),
        ]);

      const users = getArray(usersResponse, [
        "users",
        "pengguna",
        "pegawai",
      ]);

      const shifts = getArray(shiftsResponse, [
        "shifts",
        "shiftKerja",
      ]);

      const jabatan = getArray(jabatanResponse, [
        "kategoriJabatan",
        "kategoriJabatans",
        "jabatan",
      ]);

      const found = users.find((x) => getId(x?.id) === getId(id));

      if (!found) {
        throw new Error(
          "Pegawai tidak ditemukan dalam data pengguna. Pastikan akun sudah terdaftar di sistem."
        );
      }

      const savedCache = getCache();
      const cached = savedCache[getId(found.id)] || {};

      const shiftRelation =
        found.shiftKerjaMaster ??
        (typeof found.shiftKerja === "object" ? found.shiftKerja : null);

      const shiftId =
        found.shiftKerjaId ??
        shiftRelation?.id ??
        cached.shiftKerjaId ??
        "";

      const categoryId =
        found.kategoriJabatanId ??
        found.kategoriJabatan?.id ??
        cached.kategoriJabatanId ??
        "";

      setPegawai(found);
      setShiftList(shifts);
      setJabatanList(jabatan);
      setCache(cached);

      setForm({
        shiftKerjaId: getId(shiftId),
        kategoriJabatanId: getId(categoryId),
      });
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Data pegawai belum bisa dimuat. Silakan coba lagi."
      );
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    if (!pegawai?.id) {
      setError("Data pegawai tidak valid.");
      return;
    }

    if (!form.shiftKerjaId) {
      setError("Silakan pilih shift kerja terlebih dahulu.");
      return;
    }

    const selectedShift = shiftList.find(
      (x) => getId(x.id) === getId(form.shiftKerjaId)
    );

    if (!selectedShift) {
      setError(
        "Shift yang dipilih tidak ditemukan pada daftar shift aktif. Muat ulang halaman."
      );
      return;
    }

    setSaving(true);

    try {
      const payload = {
        penggunaId: pegawai.id,
        shiftKerjaId: form.shiftKerjaId,
      };

      if (form.kategoriJabatanId) {
        payload.kategoriJabatanId = form.kategoriJabatanId;
      }

      await assignUserShiftAndJabatan(payload);

      saveCache(pegawai.id, {
        shiftKerjaId: form.shiftKerjaId,
        kategoriJabatanId:
          form.kategoriJabatanId || cache?.kategoriJabatanId || "",
      });

      try {
        sessionStorage.setItem(
          "penugasan-notice",
          `Penugasan untuk ${pegawai.namaLengkap || "pegawai"} berhasil diperbarui.`
        );
      } catch {}

      router.push("/admin/presensi/penugasan-shift");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Penugasan gagal disimpan. Silakan coba lagi."
      );
    } finally {
      setSaving(false);
    }
  }

  function handleBack() {
    if (!saving) router.push("/admin/presensi/penugasan-shift");
  }

  const currentShiftName = getNamaShift(pegawai, shiftList, cache);

  const currentCategoryId =
    pegawai?.kategoriJabatanId ??
    pegawai?.kategoriJabatan?.id ??
    cache?.kategoriJabatanId ??
    "";

  const currentCategory =
    jabatanList.find(
      (x) => getId(x.id) === getId(currentCategoryId)
    ) ?? pegawai?.kategoriJabatan;

  const selectedShift = shiftList.find(
    (x) => getId(x.id) === getId(form.shiftKerjaId)
  );

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
            <div className="mx-auto w-full max-w-4xl space-y-6">
              {/* ============================================
                  PAGE HEADER
              ============================================ */}
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex items-start gap-3">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[color-mix(in_srgb,var(--color-primary)_10%,transparent)] theme-primary-text">
                    <BriefcaseBusiness size={23} />
                  </div>
                  <div>
                    <div className="mb-1 flex items-center gap-2 text-sm theme-text-muted">
                      <span>Presensi</span>
                      <span>/</span>
                      <span>Penugasan Shift</span>
                      <span>/</span>
                      <span>Atur Shift</span>
                    </div>
                    <h1 className="text-2xl font-bold tracking-tight theme-text">
                      Atur Penugasan Pegawai
                    </h1>
                    <p className="mt-1 text-sm theme-text-secondary">
                      Tentukan shift kerja dan kategori jabatan pegawai.
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

              {/* ============================================
                  ALERT ERROR
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
                    aria-label="Tutup pesan error"
                    onClick={() => setError("")}
                    className="rounded p-1 hover:bg-red-100 dark:hover:bg-red-900/40"
                  >
                    <X size={16} />
                  </button>
                </div>
              )}

              {/* ============================================
                  LOADING / NOT FOUND / FORM
              ============================================ */}
              {loading ? (
                <div className="flex min-h-[300px] flex-col items-center justify-center gap-3 theme-card rounded-xl border theme-border">
                  <LoaderCircle
                    size={28}
                    className="animate-spin theme-primary-text"
                  />
                  <p className="text-sm font-medium theme-text">
                    Memuat data pegawai...
                  </p>
                  <p className="text-xs theme-text-muted">
                    Mengambil data dari sistem
                  </p>
                </div>
              ) : !pegawai ? (
                <div className="flex min-h-[300px] flex-col items-center justify-center theme-card rounded-xl border theme-border p-6 text-center">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-50 text-red-600 dark:bg-red-950/50 dark:text-red-400">
                    <AlertCircle size={23} />
                  </div>
                  <p className="mt-4 font-semibold theme-text">
                    Pegawai tidak ditemukan
                  </p>
                  <p className="mt-1 max-w-sm text-sm theme-text-muted">
                    Pastikan akun pegawai sudah terdaftar di sistem.
                  </p>
                  <button
                    type="button"
                    onClick={loadData}
                    className={`${buttonSecondary} mt-4`}
                  >
                    <RefreshCw size={16} />
                    Muat Ulang
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* ============================================
                      KARTU PEGAWAI
                  ============================================ */}
                  <section className="theme-card overflow-hidden rounded-xl border theme-border shadow-sm">
                    <div className="flex items-start gap-4 border-b theme-border p-5 sm:p-6">
                      <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[color-mix(in_srgb,var(--color-primary)_10%,transparent)] theme-primary-text">
                        <UserRound size={24} />
                      </div>
                      <div className="min-w-0">
                        <h2 className="text-lg font-bold theme-text">
                          {pegawai.namaLengkap || "Tanpa nama"}
                        </h2>
                        <p className="mt-1 flex items-center gap-1.5 text-sm theme-text-muted">
                          <Mail size={14} />
                          {pegawai.email || "Email tidak tersedia"}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4 p-5 sm:grid-cols-2 sm:p-6">
                      <div className="rounded-xl bg-[color-mix(in_srgb,var(--color-text)_3%,transparent)] border theme-border p-4">
                        <p className="text-xs theme-text-muted">
                          Shift saat ini
                        </p>
                        <p className="mt-2 text-sm font-semibold theme-text">
                          {currentShiftName ||
                            "Belum tersedia pada data pegawai"}
                        </p>
                        {selectedShift && (
                          <p className="mt-1 flex items-center gap-1.5 text-xs theme-text-muted">
                            <Clock3 size={12} />
                            {formatJam(selectedShift.jamMasuk)} –{" "}
                            {formatJam(selectedShift.jamKeluar)}
                          </p>
                        )}
                      </div>

                      <div className="rounded-xl bg-[color-mix(in_srgb,var(--color-text)_3%,transparent)] border theme-border p-4">
                        <p className="text-xs theme-text-muted">
                          Kategori jabatan
                        </p>
                        <p className="mt-2 text-sm font-semibold theme-text">
                          {getNamaJabatan(currentCategory) ||
                            "Belum tersedia"}
                        </p>
                      </div>
                    </div>
                  </section>

                  {/* ============================================
                      FORM PENUGASAN
                  ============================================ */}
                  <section className="theme-card overflow-hidden rounded-xl border theme-border shadow-sm">
                    <div className="flex items-start gap-3 border-b theme-border p-5 sm:p-6">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[color-mix(in_srgb,var(--color-primary)_10%,transparent)] theme-primary-text">
                        <CalendarClock size={19} />
                      </div>
                      <div>
                        <h2 className="font-semibold theme-text">
                          Penugasan Shift & Jabatan
                        </h2>
                        <p className="mt-1 text-sm theme-text-muted">
                          Pilih shift aktif dan kategori jabatan pegawai.
                        </p>
                      </div>
                    </div>

                    <div className="space-y-5 p-5 sm:p-6">
                      <Field
                        label="Shift Kerja"
                        required
                        hint="Pilih shift aktif yang digunakan pada presensi pegawai."
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
                            <option key={shift.id} value={getId(shift.id)}>
                              {shift.nama} ({formatJam(shift.jamMasuk)}–
                              {formatJam(shift.jamKeluar)})
                            </option>
                          ))}
                        </select>
                        {shiftList.length === 0 && (
                          <span className="block text-xs text-amber-600 dark:text-amber-400">
                            Tidak ada shift aktif. Periksa data master shift.
                          </span>
                        )}
                      </Field>

                      <Field
                        label="Kategori Jabatan"
                        hint="Kosongkan jika kategori jabatan sebelumnya tidak ingin diubah."
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
                            <option
                              key={jabatan.id}
                              value={getId(jabatan.id)}
                            >
                              {getNamaJabatan(jabatan) || jabatan.id}
                            </option>
                          ))}
                        </select>
                      </Field>

                      <div className="flex items-start gap-2 rounded-lg border border-blue-200 bg-blue-50/70 p-4 text-sm text-blue-900 dark:border-blue-900/60 dark:bg-blue-950/30 dark:text-blue-200">
                        <Info size={18} className="mt-0.5 shrink-0" />
                        <p className="leading-6">
                          Penugasan dikirim ke sistem. Data yang dikembalikan
                          sistem tetap menjadi acuan utama.
                        </p>
                      </div>
                    </div>
                  </section>

                  {/* ============================================
                      ACTION BUTTONS
                  ============================================ */}
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
          </div>
        </main>
      </div>
    </div>
  );
}