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
} from "lucide-react";

import Header from "@/app/components/Header";
import Sidebar from "@/app/components/Sidebar";
import { apiFetch } from "@/lib/api";
import { getUsers, getUserById, verifyUserAssignment } from "@/services/user.service";
import {
  getShiftKerja,
  assignUserShiftAndJabatan,
} from "@/services/shiftKerja.service";

const JABATAN_ENDPOINT = "/api/kategori-jabatan";

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

function getShiftRelation(pegawai) {
  return (
    pegawai?.shiftKerjaMaster ??
    (pegawai?.shiftKerja != null &&
    typeof pegawai.shiftKerja === "object"
      ? pegawai.shiftKerja
      : null)
  );
}

function getCategoryRelation(pegawai) {
  return pegawai?.kategoriJabatan ?? null;
}

function resolveCurrentShift(
  pegawai,
  shiftList,
  assignmentKnown,
  shiftListLoaded
) {
  if (!assignmentKnown) {
    return { id: "", shift: null, status: "unknown" };
  }

  const relation = getShiftRelation(pegawai);
  const id = getId(pegawai?.shiftKerjaId ?? relation?.id ?? "");

  if (!id) {
    return { id: "", shift: null, status: "none" };
  }

  const found = shiftList.find((x) => getId(x.id) === id);

  if (found) return { id, shift: found, status: "assigned" };
  if (!shiftListLoaded) {
    return { id, shift: relation ?? null, status: "unverified" };
  }

  return { id, shift: relation ?? null, status: "unresolved" };
}

function resolveCurrentCategory(pegawai, jabatanList, assignmentKnown) {
  if (!assignmentKnown) {
    return { id: "", value: null, status: "unknown" };
  }

  const relation = getCategoryRelation(pegawai);
  const id = getId(pegawai?.kategoriJabatanId ?? relation?.id ?? "");

  if (!id) {
    return {
      id: "",
      value: relation,
      status: relation ? "assigned" : "none",
    };
  }

  const found = jabatanList.find((x) => getId(x.id) === id);

  if (found) return { id, value: found, status: "assigned" };
  if (relation) return { id, value: relation, status: "assigned" };

  return { id, value: null, status: "unresolved" };
}

function getErrorMessage(err, fallback) {
  return err instanceof Error && err.message ? err.message : fallback;
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

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [loadWarnings, setLoadWarnings] = useState([]);
  const [categoryTouched, setCategoryTouched] = useState(false);

  const [verification, setVerification] = useState({
    userLoaded: false,
    shiftAssignmentKnown: false,
    categoryAssignmentKnown: false,
    shiftListLoaded: false,
    categoryListLoaded: false,
    usedFallback: false,
  });

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
    setLoadWarnings([]);
    setCategoryTouched(false);
    setPegawai(null);
    setShiftList([]);
    setJabatanList([]);
    setForm({ shiftKerjaId: "", kategoriJabatanId: "" });
    setVerification({
      userLoaded: false,
      shiftAssignmentKnown: false,
      categoryAssignmentKnown: false,
      shiftListLoaded: false,
      categoryListLoaded: false,
      usedFallback: false,
    });

    const userPromise = getUserById(id).catch(async (directError) => {
      try {
        const list = await getUsers({ page: 1, limit: 200 });
        const all = getArray(list, ["users", "pengguna", "pegawai"]);
        const match = all.find((x) => getId(x?.id) === getId(id));

        if (match) {
          return { data: match, __fallback: true };
        }
      } catch {
      }

      throw directError;
    });

    const [userResult, shiftsResult, jabatanResult] =
      await Promise.allSettled([
        userPromise,
        getShiftKerja({
          page: 1,
          limit: 100,
          status: "aktif",
        }),
        apiFetch(`${JABATAN_ENDPOINT}?limit=100`, { method: "GET" }),
      ]);

    try {
      if (userResult.status === "rejected") {
        throw userResult.reason;
      }

      const userResponse = userResult.value;
      const found =
        userResponse?.data?.data ?? userResponse?.data ?? userResponse;

      if (!found?.id) {
        throw new Error(
          "Pegawai tidak ditemukan dalam data pengguna. Pastikan akun sudah terdaftar di sistem."
        );
      }

      if (found.peran?.nama?.trim().toLowerCase() === "siswa") {
        throw new Error(
          "Penugasan shift kerja dan kategori jabatan tidak berlaku untuk akun dengan peran siswa."
        );
      }

      const warnings = [];
      const usedFallback = Boolean(userResponse?.__fallback);

      if (usedFallback) {
        warnings.push(
          "Detail pegawai diambil dari daftar pengguna karena endpoint detail gagal diakses. Daftar pengguna tidak memuat informasi penugasan, jadi status penugasan tidak dapat diverifikasi."
        );
      }

      const shifts =
        shiftsResult.status === "fulfilled"
          ? getArray(shiftsResult.value, ["shifts", "shiftKerja"])
          : [];

      const jabatan =
        jabatanResult.status === "fulfilled"
          ? getArray(jabatanResult.value, [
              "kategoriJabatan",
              "kategoriJabatans",
              "jabatan",
            ])
          : [];

      if (shiftsResult.status === "rejected") {
        warnings.push(
          `Daftar shift aktif gagal dimuat: ${getErrorMessage(
            shiftsResult.reason,
            "terjadi kesalahan yang tidak diketahui"
          )}.`
        );
      }

      if (jabatanResult.status === "rejected") {
        warnings.push(
          `Daftar kategori jabatan gagal dimuat: ${getErrorMessage(
            jabatanResult.reason,
            "terjadi kesalahan yang tidak diketahui"
          )}.`
        );
      }

      const assignmentFields = verifyUserAssignment(found);

      if (!assignmentFields.shift) {
        warnings.push(
          "Response data pegawai tidak memuat shiftKerjaId atau shiftKerjaMaster, sehingga shift yang sedang terpasang tidak dapat dipastikan."
        );
      }

      if (!assignmentFields.category) {
        warnings.push(
          "Response data pegawai tidak memuat kategoriJabatanId atau kategoriJabatan, sehingga kategori jabatan yang sedang terpasang tidak dapat dipastikan."
        );
      }

      const shiftRelation = getShiftRelation(found);
      const categoryRelation = getCategoryRelation(found);

      const shiftId = assignmentFields.shift
        ? getId(found.shiftKerjaId ?? shiftRelation?.id ?? "")
        : "";

      const categoryId = assignmentFields.category
        ? getId(found.kategoriJabatanId ?? categoryRelation?.id ?? "")
        : "";

      if (
        assignmentFields.shift &&
        shiftId &&
        shiftsResult.status === "fulfilled" &&
        !shifts.some((x) => getId(x.id) === shiftId)
      ) {
        warnings.push(
          "Shift yang saat ini terpasang tidak ditemukan pada daftar shift aktif. Pilih shift aktif lain untuk menggantinya."
        );
      }

      if (
        assignmentFields.category &&
        categoryId &&
        !jabatan.some((x) => getId(x.id) === categoryId) &&
        !categoryRelation
      ) {
        warnings.push(
          "Kategori jabatan yang saat ini terpasang tidak ditemukan pada daftar kategori yang dimuat. Nilainya akan dipertahankan kecuali Anda memilih kategori lain atau mengosongkannya."
        );
      }

      setPegawai(found);
      setShiftList(shifts);
      setJabatanList(jabatan);
      setForm({
        shiftKerjaId: shiftId,
        kategoriJabatanId: categoryId,
      });
      setLoadWarnings(warnings);
      setVerification({
        userLoaded: true,
        shiftAssignmentKnown: assignmentFields.shift,
        categoryAssignmentKnown: assignmentFields.category,
        shiftListLoaded: shiftsResult.status === "fulfilled",
        categoryListLoaded: jabatanResult.status === "fulfilled",
        usedFallback,
      });
    } catch (err) {
      setError(
        getErrorMessage(
          err,
          "Data pegawai belum bisa dimuat. Silakan coba lagi."
        )
      );
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    Promise.resolve().then(() => {
      loadData();
    });
  }, [loadData]);

  const assignmentVerified =
    verification.userLoaded &&
    verification.shiftAssignmentKnown &&
    verification.categoryAssignmentKnown;

  const listsLoaded =
    verification.shiftListLoaded && verification.categoryListLoaded;

  const currentShift = resolveCurrentShift(
    pegawai,
    shiftList,
    verification.shiftAssignmentKnown,
    verification.shiftListLoaded
  );

  const currentCategory = resolveCurrentCategory(
    pegawai,
    jabatanList,
    verification.categoryAssignmentKnown
  );

  const categoryOptions = [...jabatanList];

  if (
    currentCategory.id &&
    !categoryOptions.some(
      (x) => getId(x.id) === getId(currentCategory.id)
    )
  ) {
    categoryOptions.unshift({
      id: currentCategory.id,
      nama:
        getNamaJabatan(currentCategory.value) ||
        "Kategori jabatan saat ini",
    });
  }

  const shiftOptions = [...shiftList];

  if (
    currentShift.id &&
    !shiftOptions.some(
      (x) => getId(x.id) === getId(currentShift.id)
    )
  ) {
    shiftOptions.unshift({
      id: currentShift.id,
      nama: currentShift.shift?.nama || "Shift saat ini",
      jamMasuk: currentShift.shift?.jamMasuk ?? null,
      jamKeluar: currentShift.shift?.jamKeluar ?? null,
    });
  }

  const isSelectedShiftActive = Boolean(
    form.shiftKerjaId &&
      shiftList.some((x) => getId(x.id) === getId(form.shiftKerjaId))
  );

  const canSave =
    Boolean(pegawai?.id) &&
    assignmentVerified &&
    listsLoaded &&
    shiftList.length > 0 &&
    isSelectedShiftActive &&
    !loading &&
    !saving;

  let saveBlockedMessage = "";

  if (!assignmentVerified) {
    saveBlockedMessage =
      "Penyimpanan dinonaktifkan karena data penugasan yang tersimpan belum dapat diverifikasi dari API. Memuat ulang halaman tidak akan mengubah data; hubungi administrator sistem jika masalah berlanjut.";
  } else if (!verification.shiftListLoaded) {
    saveBlockedMessage =
      "Penyimpanan dinonaktifkan karena daftar shift aktif gagal dimuat. Muat ulang halaman.";
  } else if (!verification.categoryListLoaded) {
    saveBlockedMessage =
      "Penyimpanan dinonaktifkan karena daftar kategori jabatan gagal dimuat. Muat ulang halaman.";
  } else if (shiftList.length === 0) {
    saveBlockedMessage =
      "Penyimpanan dinonaktifkan karena belum ada shift aktif. Tambahkan shift aktif terlebih dahulu di Master Shift.";
  } else if (!form.shiftKerjaId) {
    saveBlockedMessage =
      "Penyimpanan dinonaktifkan karena shift kerja belum dipilih. Pilih salah satu shift aktif.";
  } else if (!isSelectedShiftActive) {
    saveBlockedMessage =
      "Penyimpanan dinonaktifkan karena shift yang dipilih tidak ada dalam daftar shift aktif. Pilih shift aktif untuk menyimpan penugasan.";
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    if (!pegawai?.id) {
      setError("Data pegawai tidak valid.");
      return;
    }

    if (!canSave) {
      setError(
        saveBlockedMessage ||
          "Data yang diperlukan belum berhasil dimuat. Muat ulang halaman."
      );
      return;
    }

    if (!form.shiftKerjaId) {
      setError("Silakan pilih shift kerja terlebih dahulu.");
      return;
    }

    if (!isSelectedShiftActive) {
      setError(
        "Shift yang dipilih tidak ada dalam daftar shift aktif. Silakan pilih shift yang aktif sebelum menyimpan."
      );
      return;
    }

    if (
      form.kategoriJabatanId &&
      !categoryOptions.some(
        (x) => getId(x.id) === getId(form.kategoriJabatanId)
      )
    ) {
      setError(
        "Kategori jabatan yang dipilih tidak ditemukan pada daftar kategori. Muat ulang halaman."
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
      } else if (categoryTouched && verification.categoryAssignmentKnown) {
        payload.kategoriJabatanId = null;
      }

      await assignUserShiftAndJabatan(payload);

      try {
        sessionStorage.setItem(
          "penugasan-notice",
          `Penugasan untuk ${pegawai.namaLengkap || "pegawai"} berhasil disimpan.`
        );
      } catch {}

      router.push("/admin/presensi/penugasan-shift");
    } catch (err) {
      setError(
        getErrorMessage(
          err,
          "Penugasan gagal disimpan. Silakan coba lagi."
        )
      );
    } finally {
      setSaving(false);
    }
  }

  function handleBack() {
    if (!saving) router.push("/admin/presensi/penugasan-shift");
  }

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

              {loadWarnings.length > 0 && (
                <div
                  role="status"
                  className="flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800 dark:border-amber-900/60 dark:bg-amber-950/30 dark:text-amber-200"
                >
                  <AlertCircle size={19} className="mt-0.5 shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold">
                      Data penugasan belum dapat diverifikasi sepenuhnya
                    </p>
                    <ul className="mt-1 list-disc space-y-1 pl-4 text-xs leading-5">
                      {loadWarnings.map((warning) => (
                        <li key={warning}>{warning}</li>
                      ))}
                    </ul>
                    <p className="mt-2 text-xs leading-5">
                      {canSave
                        ? "Periksa kembali data penugasan sebelum menyimpan. Nilai yang tidak dapat dipastikan tidak diisi secara otomatis."
                        : "Tombol Simpan dinonaktifkan selama data penting belum berhasil dimuat atau divalidasi. Muat ulang halaman setelah koneksi atau izin akses diperbaiki. Jika masalah berlanjut, laporkan kepada administrator sistem."}
                    </p>
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
                        {currentShift.status === "unknown" ? (
                          <>
                            <p className="mt-2 text-sm font-semibold theme-text">
                              Data penugasan belum dapat diverifikasi
                            </p>
                            <p className="mt-1 text-xs leading-5 theme-text-muted">
                              Response data pegawai belum memuat ID shift
                              kerja. Status ini bukan berarti pegawai belum
                              ditugaskan.
                            </p>
                          </>
                        ) : currentShift.status === "none" ? (
                          <p className="mt-2 text-sm font-semibold theme-text">
                            Belum ditugaskan
                          </p>
                        ) : currentShift.shift?.nama ? (
                          <>
                            <p className="mt-2 text-sm font-semibold theme-text">
                              {currentShift.shift.nama}
                            </p>
                            {(currentShift.shift.jamMasuk ||
                              currentShift.shift.jamKeluar) && (
                              <p className="mt-1 flex items-center gap-1.5 text-xs theme-text-muted">
                                <Clock3 size={12} />
                                {formatJam(currentShift.shift.jamMasuk)} –{" "}
                                {formatJam(currentShift.shift.jamKeluar)}
                              </p>
                            )}
                            {currentShift.status === "unresolved" && (
                              <p className="mt-1 text-xs text-amber-600 dark:text-amber-400">
                                Shift ini tidak ditemukan pada daftar shift
                                aktif.
                              </p>
                            )}
                          </>
                        ) : (
                          <>
                            <p className="mt-2 text-sm font-semibold theme-text">
                              Shift saat ini tidak dapat ditampilkan
                            </p>
                            <p className="mt-1 break-all text-xs theme-text-muted">
                              ID shift: {currentShift.id}
                            </p>
                          </>
                        )}
                      </div>

                      <div className="rounded-xl bg-[color-mix(in_srgb,var(--color-text)_3%,transparent)] border theme-border p-4">
                        <p className="text-xs theme-text-muted">
                          Kategori jabatan saat ini
                        </p>
                        {currentCategory.status === "unknown" ? (
                          <>
                            <p className="mt-2 text-sm font-semibold theme-text">
                              Data penugasan belum dapat diverifikasi
                            </p>
                            <p className="mt-1 text-xs leading-5 theme-text-muted">
                              Response data pegawai belum memuat ID kategori
                              jabatan. Status ini bukan berarti kategori belum
                              ditentukan.
                            </p>
                          </>
                        ) : (
                          <>
                            <p className="mt-2 text-sm font-semibold theme-text">
                              {getNamaJabatan(currentCategory.value) ||
                                (currentCategory.id
                                  ? `Kategori jabatan saat ini (ID: ${currentCategory.id})`
                                  : "Belum ditentukan")}
                            </p>
                            {currentCategory.status === "unresolved" && (
                              <p className="mt-1 text-xs text-amber-600 dark:text-amber-400">
                                Kategori ini tidak ditemukan pada daftar
                                kategori yang dimuat; nilainya dipertahankan.
                              </p>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  </section>

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
                        hint={
                          !verification.shiftAssignmentKnown
                            ? "Shift yang sedang terpasang belum dapat diverifikasi dari API. Pilihan dan penyimpanan dinonaktifkan."
                            : !verification.shiftListLoaded
                              ? "Daftar shift aktif gagal dimuat. Muat ulang halaman."
                              : "Pilih shift aktif yang digunakan pada presensi pegawai."
                        }
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
                          disabled={
                            saving ||
                            !verification.shiftAssignmentKnown ||
                            !verification.shiftListLoaded
                          }
                        >
                          <option value="">Pilih shift kerja</option>
                          {shiftOptions.map((shift) => {
                            const isActive = shiftList.some(
                              (x) => getId(x.id) === getId(shift.id)
                            );

                            return (
                              <option
                                key={shift.id}
                                value={getId(shift.id)}
                              >
                                {shift.nama} (
                                {formatJam(shift.jamMasuk)}–
                                {formatJam(shift.jamKeluar)})
                                {isActive
                                  ? ""
                                  : " — tidak ada di daftar shift aktif"}
                              </option>
                            );
                          })}
                        </select>
                        {form.shiftKerjaId &&
                          verification.shiftListLoaded &&
                          !isSelectedShiftActive && (
                            <span className="mt-1.5 flex items-start gap-1.5 rounded-lg border border-amber-200 bg-amber-50/70 px-3 py-2 text-xs leading-5 text-amber-700 dark:border-amber-900/60 dark:bg-amber-950/30 dark:text-amber-300">
                              <AlertCircle size={14} className="mt-0.5 shrink-0" />
                              Shift yang saat ini dipilih tidak ada dalam daftar shift aktif. Silakan pilih shift yang aktif untuk dapat menyimpan penugasan.
                            </span>
                          )}
                        {verification.shiftListLoaded &&
                          shiftList.length === 0 && (
                            <span className="block text-xs text-amber-600 dark:text-amber-400">
                              Tidak ada shift aktif. Periksa data master
                              shift.
                            </span>
                          )}
                      </Field>

                      <Field
                        label="Kategori Jabatan"
                        hint={
                          !verification.categoryAssignmentKnown
                            ? "Kategori jabatan yang sedang terpasang belum dapat diverifikasi dari API. Pilihan dan penyimpanan dinonaktifkan."
                            : "Pilih kategori jabatan pegawai. Pilih opsi kosong hanya jika Anda benar-benar ingin menghapus kategori yang sedang terpasang."
                        }
                      >
                        <select
                          value={form.kategoriJabatanId}
                          onChange={(e) => {
                            setCategoryTouched(true);
                            setForm((prev) => ({
                              ...prev,
                              kategoriJabatanId: e.target.value,
                            }));
                          }}
                          className={inputClass}
                          disabled={
                            saving ||
                            !verification.categoryAssignmentKnown ||
                            !verification.categoryListLoaded
                          }
                        >
                          <option value="">
                            {verification.categoryAssignmentKnown
                              ? "Kosongkan kategori jabatan (hapus)"
                              : "Data kategori belum dapat diverifikasi"}
                          </option>
                          {categoryOptions.map((jabatan) => (
                            <option
                              key={jabatan.id}
                              value={getId(jabatan.id)}
                            >
                              {getNamaJabatan(jabatan) ||
                                (getId(jabatan.id) === currentCategory.id
                                  ? "Kategori jabatan saat ini"
                                  : jabatan.id)}
                            </option>
                          ))}
                        </select>
                        {verification.categoryAssignmentKnown &&
                          currentCategory.id &&
                          !form.kategoriJabatanId &&
                          categoryTouched && (
                            <span className="mt-1.5 flex items-start gap-1.5 rounded-lg border border-amber-200 bg-amber-50/70 px-3 py-2 text-xs leading-5 text-amber-700 dark:border-amber-900/60 dark:bg-amber-950/30 dark:text-amber-300">
                              <Info size={14} className="mt-0.5 shrink-0" />
                              Kategori jabatan saat ini akan dihapus saat
                              penugasan disimpan.
                            </span>
                          )}
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
                        Batal
                      </button>
                      <button
                        type="submit"
                        disabled={!canSave}
                        title={
                          !canSave ? saveBlockedMessage || undefined : undefined
                        }
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