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
  X,
  Mail,
  CalendarClock,
  Info,
  RefreshCw,
  CheckCircle2,
} from "lucide-react";

import Header from "@/app/components/Header";
import Sidebar from "@/app/components/Sidebar";
import { apiFetch } from "@/lib/api";
import { getUsers, getUserById } from "@/services/user.service";
import {
  getShiftKerja,
  assignUserShiftAndJabatan,
} from "@/services/shiftKerja.service";

function getId(value) {
  if (value === null || value === undefined || value === "") {
    return "";
  }

  if (typeof value === "object") {
    return String(value.id ?? value.shiftKerjaId ?? "");
  }

  return String(value);
}

function unwrapData(response) {
  let current = response;

  for (let i = 0; i < 8 && current != null; i++) {
    if (Array.isArray(current)) return current;

    if (typeof current !== "object") return current;

    if (current.success === false) {
      throw new Error(current.message || "Permintaan API gagal.");
    }

    if (
      current.id ||
      current.shiftKerjaId ||
      current.kategoriJabatanId
    ) {
      return current;
    }

    if ("data" in current) {
      current = current.data;
      continue;
    }

    if ("result" in current) {
      current = current.result;
      continue;
    }

    return current;
  }

  return current;
}

function getArray(response, keys = []) {
  let current = response;

  for (let i = 0; i < 8 && current != null; i++) {
    if (Array.isArray(current)) return current;

    if (typeof current !== "object") return [];

    for (const key of keys) {
      if (Array.isArray(current[key])) {
        return current[key];
      }
    }

    if (Array.isArray(current.items)) {
      return current.items;
    }

    if (Array.isArray(current.results)) {
      return current.results;
    }

    if (!("data" in current)) return [];

    current = current.data;
  }

  return Array.isArray(current) ? current : [];
}

function getNamaJabatan(value) {
  if (typeof value === "string") return value;

  return (
    value?.nama ??
    value?.namaKategori ??
    value?.namaJabatan ??
    value?.namaKategoriJabatan ??
    value?.namaTampilan ??
    ""
  );
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

function getErrorMessage(error, fallback) {
  return error instanceof Error && error.message
    ? error.message
    : fallback;
}

function unwrapUserResponse(response) {
  let current = response;

  for (let i = 0; i < 8 && current != null; i++) {
    if (typeof current !== "object" || Array.isArray(current)) {
      return null;
    }

    if (current.id) return current;

    if (current.success === false) {
      throw new Error(current.message || "Penyimpanan gagal.");
    }

    if ("data" in current) {
      current = current.data;
      continue;
    }

    if ("result" in current) {
      current = current.result;
      continue;
    }

    return null;
  }

  return current?.id ? current : null;
}

const inputClass =
  "theme-input h-11 w-full rounded-xl border px-3.5 text-sm outline-none transition disabled:opacity-50";

const buttonSecondary =
  "inline-flex items-center justify-center gap-2 rounded-xl border theme-border theme-card px-4 py-2.5 text-sm font-medium theme-text-secondary hover:bg-[color-mix(in_srgb,var(--color-text)_3%,transparent)] disabled:cursor-not-allowed disabled:opacity-50 transition";

const buttonPrimary =
  "inline-flex items-center justify-center gap-2 rounded-xl theme-primary px-4 py-2.5 text-sm font-semibold text-white hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50 transition";

const REDIRECT_PATH = "/admin/presensi/penugasan-shift";

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

export default function AturShiftPegawaiPage() {
  const params = useParams();
  const router = useRouter();

  const rawId = params?.id;
  const id = Array.isArray(rawId) ? rawId[0] : rawId;

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [pegawai, setPegawai] = useState(null);
  const [shiftList, setShiftList] = useState([]);
  const [jabatanList, setJabatanList] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loadWarnings, setLoadWarnings] = useState([]);

  const [form, setForm] = useState({
    shiftKerjaId: "",
    kategoriJabatanId: "",
  });

  const [categoryTouched, setCategoryTouched] = useState(false);

  const loadData = useCallback(async () => {
    if (!id) {
      setLoading(false);
      setError("ID pegawai tidak ditemukan pada URL.");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");
    setLoadWarnings([]);
    setPegawai(null);
    setShiftList([]);
    setJabatanList([]);
    setCategoryTouched(false);

    setForm({
      shiftKerjaId: "",
      kategoriJabatanId: "",
    });

    try {
      const [userResult, shiftsResult, categoriesResult] =
        await Promise.allSettled([
          getUserById(id),
          getShiftKerja({
            page: 1,
            limit: 100,
            status: "aktif",
          }),
          apiFetch("/kategori-jabatan?limit=100", {
            method: "GET",
          }),
        ]);

      const warnings = [];

      let user = null;

      if (userResult.status === "fulfilled") {
        try {
          user = unwrapUserResponse(userResult.value);
        } catch {
          user = null;
        }
      }

      // Fallback ke daftar pengguna jika detail tidak mengembalikan data.
      if (!user?.id) {
        try {
          const response = await getUsers({
            page: 1,
            limit: 200,
          });

          const users = getArray(response, [
            "users",
            "pengguna",
            "pegawai",
          ]);

          user =
            users.find(
              (item) => getId(item?.id) === getId(id)
            ) ?? null;
        } catch {
          // Error detail akan ditampilkan jika fallback tidak berhasil.
        }
      }

      if (!user?.id) {
        if (userResult.status === "rejected") {
          throw userResult.reason;
        }

        throw new Error(
          "Data pegawai tidak ditemukan. Periksa ID pada URL dan akses akun."
        );
      }

      const roleName = String(
        user.peran?.nama ?? user.role ?? ""
      )
        .trim()
        .toLowerCase()
        .replace(/[\s-]+/g, "_");

      if (roleName === "siswa") {
        throw new Error(
          "Penugasan shift kerja dan kategori jabatan tidak berlaku untuk akun siswa."
        );
      }

      const shifts =
        shiftsResult.status === "fulfilled"
          ? getArray(shiftsResult.value, [
              "shifts",
              "shiftKerja",
            ])
          : [];

      const categories =
        categoriesResult.status === "fulfilled"
          ? getArray(categoriesResult.value, [
              "kategoriJabatan",
              "kategoriJabatans",
              "kategori",
              "jabatan",
            ])
          : [];

      if (shiftsResult.status === "rejected") {
        warnings.push(
          `Daftar shift gagal dimuat: ${getErrorMessage(
            shiftsResult.reason,
            "terjadi kesalahan"
          )}`
        );
      }

      if (categoriesResult.status === "rejected") {
        warnings.push(
          `Daftar kategori jabatan gagal dimuat: ${getErrorMessage(
            categoriesResult.reason,
            "terjadi kesalahan"
          )}`
        );
      }

      const currentShiftId = getId(
        user.shiftKerjaId ??
          user.shiftKerjaMaster?.id ??
          ""
      );

      const currentCategoryId = getId(
        user.kategoriJabatanId ??
          user.kategoriJabatan?.id ??
          ""
      );

      if (
        !user.shiftKerjaId &&
        !user.shiftKerjaMaster &&
        !user.kategoriJabatanId &&
        !user.kategoriJabatan
      ) {
        warnings.push(
          "Data penugasan sebelumnya belum tersedia pada respons pengguna. Pastikan endpoint GET pengguna mengirim shiftKerjaId, shiftKerjaMaster, kategoriJabatanId, dan kategoriJabatan."
        );
      }

      setPegawai(user);
      setShiftList(shifts);
      setJabatanList(categories);
      setLoadWarnings(warnings);

      setForm({
        shiftKerjaId: currentShiftId,
        kategoriJabatanId: currentCategoryId,
      });
    } catch (loadError) {
      setError(
        getErrorMessage(
          loadError,
          "Data pegawai gagal dimuat. Silakan coba lagi."
        )
      );
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const selectedShift =
    shiftList.find(
      (item) => getId(item.id) === getId(form.shiftKerjaId)
    ) ?? null;

  const selectedCategory =
    jabatanList.find(
      (item) => getId(item.id) === getId(form.kategoriJabatanId)
    ) ?? null;

  const currentShift =
    selectedShift ?? pegawai?.shiftKerjaMaster ?? null;

  const currentCategory =
    selectedCategory ?? pegawai?.kategoriJabatan ?? null;

  const canSave =
    Boolean(pegawai?.id) &&
    shiftList.length > 0 &&
    Boolean(form.shiftKerjaId) &&
    Boolean(selectedShift) &&
    !loading &&
    !saving;

  let saveBlockedMessage = "";

  if (loading) {
    saveBlockedMessage = "Sedang memuat data.";
  } else if (!shiftList.length) {
    saveBlockedMessage =
      "Daftar shift belum tersedia. Periksa master shift dan coba muat ulang.";
  } else if (!form.shiftKerjaId) {
    saveBlockedMessage = "Pilih shift kerja sebelum menyimpan.";
  } else if (!selectedShift) {
    saveBlockedMessage =
      "Shift yang dipilih tidak ditemukan dalam daftar shift.";
  }

  async function handleSubmit(event) {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (!pegawai?.id) {
      setError("Data pegawai tidak valid.");
      return;
    }

    if (!form.shiftKerjaId || !selectedShift) {
      setError("Pilih shift kerja yang tersedia sebelum menyimpan.");
      return;
    }

    if (form.kategoriJabatanId && !selectedCategory) {
      setError(
        "Kategori jabatan yang dipilih tidak ditemukan. Muat ulang halaman."
      );
      return;
    }

    setSaving(true);

    try {
      const payload = {
        penggunaId: pegawai.id,
        shiftKerjaId: form.shiftKerjaId,
      };

      // Jangan mengubah kategori jika pengguna tidak menyentuh dropdown.
      if (categoryTouched) {
        payload.kategoriJabatanId =
          form.kategoriJabatanId || null;
      }

      const response = await assignUserShiftAndJabatan(payload);

      if (response?.success === false) {
        throw new Error(
          response.message || "Penugasan gagal disimpan."
        );
      }

      // Redirect langsung ke halaman daftar penugasan setelah berhasil simpan.
      router.push(REDIRECT_PATH);
    } catch (saveError) {
      setError(
        getErrorMessage(
          saveError,
          "Penugasan gagal disimpan. Periksa koneksi dan coba lagi."
        )
      );

      setSaving(false);
    }
  }

  function handleBack() {
    if (!saving) {
      router.push(REDIRECT_PATH);
    }
  }

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
            <div className="w-full space-y-6">
              {/* Header halaman — tombol Kembali di kiri atas */}
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
                <button
                  type="button"
                  onClick={handleBack}
                  disabled={saving}
                  className={`${buttonSecondary} shrink-0`}
                  title="Kembali ke daftar penugasan"
                >
                  <ArrowLeft size={17} />
                  Kembali
                </button>

                <div className="flex min-w-0 flex-1 items-start gap-3">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[color-mix(in_srgb,var(--color-primary)_10%,transparent)] theme-primary-text">
                    <BriefcaseBusiness size={23} />
                  </div>

                  <div className="min-w-0">
                   
                    <h1 className="text-2xl font-bold tracking-tight theme-text">
                      Atur Penugasan Pegawai
                    </h1>

                    <p className="mt-1 text-sm theme-text-secondary">
                      Tentukan shift kerja dan kategori jabatan pegawai.
                    </p>
                  </div>
                </div>
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
                    aria-label="Tutup pesan error"
                    onClick={() => setError("")}
                    className="rounded p-1 hover:bg-red-100 dark:hover:bg-red-900/40"
                  >
                    <X size={16} />
                  </button>
                </div>
              )}

              {success && (
                <div
                  role="status"
                  className="flex items-start gap-3 rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-800 dark:border-green-900/60 dark:bg-green-950/30 dark:text-green-300"
                >
                  <CheckCircle2 size={19} className="mt-0.5 shrink-0" />

                  <div className="min-w-0 flex-1">
                    <p className="font-semibold">
                      Penugasan berhasil disimpan
                    </p>
                    <p className="mt-1">{success}</p>
                  </div>
                </div>
              )}

              {loadWarnings.length > 0 && (
                <div
                  role="status"
                  className="flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800 dark:border-amber-900/60 dark:bg-amber-950/30 dark:text-amber-200"
                >
                  <AlertCircle size={19} className="mt-0.5 shrink-0" />

                  <div className="min-w-0 flex-1">
                    <p className="font-semibold">
                      Informasi pemuatan data
                    </p>

                    <ul className="mt-1 list-disc space-y-1 pl-4 text-xs leading-5">
                      {loadWarnings.map((warning) => (
                        <li key={warning}>{warning}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

              {loading ? (
                <div className="theme-card flex min-h-[300px] flex-col items-center justify-center gap-3 rounded-xl border theme-border">
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
                <div className="theme-card flex min-h-[300px] flex-col items-center justify-center rounded-xl border theme-border p-6 text-center">
                  <AlertCircle size={28} className="text-red-500" />

                  <p className="mt-4 font-semibold theme-text">
                    Pegawai tidak ditemukan
                  </p>

                  <p className="mt-1 max-w-sm text-sm theme-text-muted">
                    Pastikan akun pegawai terdaftar dan kamu memiliki akses.
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
                  {/* Kartu informasi pegawai */}
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

                        {pegawai.peran?.nama && (
                          <p className="mt-1 text-xs theme-text-muted">
                            Peran:{" "}
                            {pegawai.peran.namaTampilan ||
                              pegawai.peran.nama}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Stat cards responsif dengan breakpoint 2xl:grid-cols-6 */}
                    <div className="grid grid-cols-1 gap-4 p-5 sm:grid-cols-2 sm:p-6 2xl:grid-cols-6">
                      <div className="rounded-xl border theme-border bg-[color-mix(in_srgb,var(--color-text)_3%,transparent)] p-4 2xl:col-span-3">
                        <p className="text-xs theme-text-muted">
                          Shift kerja
                        </p>

                        <p className="mt-2 text-sm font-semibold theme-text">
                          {currentShift?.nama ||
                            currentShift?.kode ||
                            (pegawai.shiftKerja
                              ? `Shift ${pegawai.shiftKerja}`
                              : "Belum ditentukan")}
                        </p>

                        {currentShift && (
                          <p className="mt-1 flex items-center gap-1.5 text-xs theme-text-muted">
                            <Clock3 size={12} />
                            {formatJam(currentShift.jamMasuk)} –{" "}
                            {formatJam(currentShift.jamKeluar)}
                          </p>
                        )}
                      </div>

                      <div className="rounded-xl border theme-border bg-[color-mix(in_srgb,var(--color-text)_3%,transparent)] p-4 2xl:col-span-3">
                        <p className="text-xs theme-text-muted">
                          Kategori jabatan
                        </p>

                        <p className="mt-2 text-sm font-semibold theme-text">
                          {getNamaJabatan(currentCategory) ||
                            "Belum ditentukan"}
                        </p>
                      </div>
                    </div>
                  </section>

                  {/* Kartu form penugasan */}
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
                        hint="Shift kerja wajib dipilih sebelum penugasan dapat disimpan."
                      >
                        <select
                          required
                          value={form.shiftKerjaId}
                          onChange={(event) => {
                            setSuccess("");
                            setForm((previous) => ({
                              ...previous,
                              shiftKerjaId: event.target.value,
                            }));
                          }}
                          className={inputClass}
                          disabled={saving || shiftList.length === 0}
                        >
                          <option value="">Pilih shift kerja</option>

                          {shiftList.map((shift) => (
                            <option
                              key={shift.id}
                              value={getId(shift.id)}
                            >
                              {shift.nama || shift.kode || "Shift"} (
                              {formatJam(shift.jamMasuk)}–
                              {formatJam(shift.jamKeluar)})
                            </option>
                          ))}
                        </select>

                        {shiftList.length === 0 && !loading && (
                          <span className="block text-xs text-amber-600 dark:text-amber-400">
                            Tidak ada shift yang tersedia. Periksa master shift
                            atau filter status pada endpoint.
                          </span>
                        )}
                      </Field>

                      <Field
                        label="Kategori Jabatan"
                        hint="Opsional. Jika tidak diubah, kategori yang tersimpan tetap dipertahankan."
                      >
                        <select
                          value={form.kategoriJabatanId}
                          onChange={(event) => {
                            setCategoryTouched(true);
                            setSuccess("");

                            setForm((previous) => ({
                              ...previous,
                              kategoriJabatanId: event.target.value,
                            }));
                          }}
                          className={inputClass}
                          disabled={saving}
                        >
                          <option value="">
                            {pegawai.kategoriJabatanId ||
                            pegawai.kategoriJabatan
                              ? "Kosongkan kategori jabatan"
                              : "Pilih kategori jabatan (opsional)"}
                          </option>

                          {jabatanList.map((jabatan) => (
                            <option
                              key={jabatan.id}
                              value={getId(jabatan.id)}
                            >
                              {getNamaJabatan(jabatan) ||
                                `Kategori ${jabatan.id}`}
                            </option>
                          ))}
                        </select>

                        {jabatanList.length === 0 && !loading && (
                          <span className="block text-xs text-amber-600 dark:text-amber-400">
                            Daftar kategori jabatan kosong atau belum tersedia.
                            Shift tetap dapat disimpan.
                          </span>
                        )}
                      </Field>

                      <div className="flex items-start gap-2 rounded-lg border border-blue-200 bg-blue-50/70 p-4 text-sm text-blue-900 dark:border-blue-900/60 dark:bg-blue-950/30 dark:text-blue-200">
                        <Info size={18} className="mt-0.5 shrink-0" />

                       
                      </div>
                    </div>
                  </section>

                  {/* Tabel ringkasan penugasan */}
                  <section className="theme-card overflow-hidden rounded-xl border theme-border shadow-sm">
                    <div className="flex items-start gap-3 border-b theme-border p-5 sm:p-6">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[color-mix(in_srgb,var(--color-primary)_10%,transparent)] theme-primary-text">
                        <Clock3 size={19} />
                      </div>

                      <div>
                        <h2 className="font-semibold theme-text">
                          Ringkasan Penugasan
                        </h2>

                        <p className="mt-1 text-sm theme-text-muted">
                          Data penugasan aktif pegawai saat ini.
                        </p>
                      </div>
                    </div>

                    <div className="w-full overflow-x-auto">
                      <table className="w-full min-w-[640px] text-left text-sm">
                        <thead className="border-b theme-border bg-[color-mix(in_srgb,var(--color-text)_3%,transparent)]">
                          <tr>
                            <th className="px-5 py-3 font-semibold theme-text">
                              Shift
                            </th>
                            <th className="px-5 py-3 font-semibold theme-text">
                              Jam Masuk
                            </th>
                            <th className="px-5 py-3 font-semibold theme-text">
                              Jam Keluar
                            </th>
                            <th className="px-5 py-3 font-semibold theme-text">
                              Kategori Jabatan
                            </th>
                          </tr>
                        </thead>

                        <tbody>
                          <tr className="border-b theme-border last:border-b-0">
                            <td className="px-5 py-3 theme-text">
                              {currentShift?.nama ||
                                currentShift?.kode ||
                                "-"}
                            </td>
                            <td className="px-5 py-3 theme-text-secondary">
                              {formatJam(currentShift?.jamMasuk)}
                            </td>
                            <td className="px-5 py-3 theme-text-secondary">
                              {formatJam(currentShift?.jamKeluar)}
                            </td>
                            <td className="px-5 py-3 theme-text-secondary">
                              {getNamaJabatan(currentCategory) || "-"}
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </section>

                  <div className="border-t theme-border pt-5">
                    {!canSave && saveBlockedMessage && (
                      <p className="mb-3 flex items-start gap-2 text-xs leading-5 text-amber-700 dark:text-amber-300">
                        <AlertCircle size={15} className="mt-0.5 shrink-0" />
                        <span>{saveBlockedMessage}</span>
                      </p>
                    )}

                    <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                      <button
                        type="button"
                        onClick={handleBack}
                        disabled={saving}
                        className={buttonSecondary}
                      >
                        <ArrowLeft size={16} />
                        Batal
                      </button>

                      <button
                        type="submit"
                        disabled={!canSave}
                        title={!canSave ? saveBlockedMessage : undefined}
                        className={buttonPrimary}
                      >
                        {saving ? (
                          <LoaderCircle
                            size={17}
                            className="animate-spin"
                          />
                        ) : (
                          <Save size={17} />
                        )}

                        {saving ? "Menyimpan..." : "Simpan Penugasan"}
                      </button>
                    </div>
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