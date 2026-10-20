"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

import Header from "@/app/components/Header";
import Sidebar from "@/app/components/Sidebar";
import { getUserById, updateUser } from "@/services/user.service";
import { getKategoriJabatan } from "@/services/kategoriJabatan.service";
import {
  getShiftKerja,
  assignUserShiftAndJabatan,
} from "@/services/shiftKerja.service";

import {
  ArrowLeft,
  Save,
  Loader2,
  UserRound,
  BriefcaseBusiness,
  MapPin,
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";

/* =========================================================
   CONSTANTS
========================================================= */

const initialForm = {
  namaLengkap: "",
  namaPengguna: "",
  email: "",
  noTelepon: "",
  nip: "",
  nuptk: "",
  nipd: "",
  nisn: "",
  nik: "",
  jenisKelamin: "",
  tempatLahir: "",
  tanggalLahir: "",
  alamat: "",
  jabatan: "",
  golongan: "",
  status: "aktif",
  kategoriJabatanId: "",
  shiftKerjaId: "",
};

const inputClass =
  "w-full rounded-lg border theme-border theme-input px-3.5 py-2.5 text-sm outline-none transition placeholder:theme-text-placeholder focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[color-mix(in_srgb,var(--color-primary)_15%,transparent)] disabled:opacity-60";

const labelClass = "mb-1.5 block text-sm font-medium theme-text-secondary";

/* =========================================================
   HELPERS
========================================================= */

function getErrorMessage(error) {
  return error instanceof Error
    ? error.message
    : "Terjadi kesalahan. Silakan coba kembali.";
}

function toDateInput(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value).slice(0, 10);
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0"),
  ].join("-");
}

function normalizeRoleName(user) {
  return String(
    user?.peran?.nama || user?.peran?.namaTampilan || user?.role || ""
  )
    .toLowerCase()
    .replace(/[\s-]+/g, "_");
}

function unwrapList(response) {
  if (Array.isArray(response)) return response;
  if (Array.isArray(response?.data)) return response.data;
  if (Array.isArray(response?.items)) return response.items;
  if (Array.isArray(response?.data?.items)) return response.data.items;
  if (Array.isArray(response?.data?.data)) return response.data.data;
  return [];
}

function getKategoriId(user) {
  return String(
    user?.kategoriJabatanId ?? user?.kategoriJabatan?.id ?? ""
  );
}

function getShiftId(user) {
  return String(
    user?.shiftKerjaId ?? user?.shiftKerjaMaster?.id ?? ""
  );
}

function getShiftLabel(item) {
  return (
    item?.nama ||
    item?.namaShift ||
    item?.namaShiftKerja ||
    item?.kode ||
    [item?.jamMulai, item?.jamSelesai].filter(Boolean).join(" - ") ||
    "Shift kerja"
  );
}

/* =========================================================
   PAGE
========================================================= */

export default function EditUserPage() {
  const params = useParams();
  const router = useRouter();
  const id = Array.isArray(params?.id) ? params.id[0] : params?.id;

  const [form, setForm] = useState(initialForm);
  const [userRole, setUserRole] = useState("");
  const [schoolName, setSchoolName] = useState("-");
  const [kategoriOptions, setKategoriOptions] = useState([]);
  const [shiftOptions, setShiftOptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const isGuru = userRole === "guru";
  const isSiswa = userRole === "siswa";

  /* =======================================================
     LOAD
  ======================================================= */
  const loadUser = useCallback(async () => {
    if (!id) {
      setError("ID pengguna tidak ditemukan.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError("");

    try {
      const [userResponse, kategoriResponse, shiftResponse] =
        await Promise.all([
          getUserById(String(id)),
          getKategoriJabatan({ page: 1, limit: 100, status: "aktif" }),
          getShiftKerja({ page: 1, limit: 100 }),
        ]);

      const user = userResponse?.data;

      if (!userResponse?.success || !user) {
        throw new Error(
          userResponse?.message || "Data pengguna tidak ditemukan."
        );
      }

      const role = normalizeRoleName(user);
      const kategoriList = unwrapList(kategoriResponse);
      const shiftList = unwrapList(shiftResponse);

      setUserRole(role);
      setSchoolName(user?.sekolah?.nama || "-");

      const kategoriId = getKategoriId(user);
      const shiftId = getShiftId(user);

      const savedKategori = user?.kategoriJabatan;
      const savedShift = user?.shiftKerjaMaster;

      const finalKategoriList =
        savedKategori &&
        typeof savedKategori === "object" &&
        savedKategori.id &&
        !kategoriList.some(
          (item) => String(item.id) === String(savedKategori.id)
        )
          ? [...kategoriList, savedKategori]
          : kategoriList;

      const activeShifts = shiftList.filter(
        (item) =>
          String(item?.status || "aktif").toLowerCase() === "aktif"
      );

      const finalShiftList =
        savedShift &&
        typeof savedShift === "object" &&
        savedShift.id &&
        !activeShifts.some(
          (item) => String(item.id) === String(savedShift.id)
        )
          ? [...activeShifts, savedShift]
          : activeShifts;

      setKategoriOptions(finalKategoriList);
      setShiftOptions(finalShiftList);

      setForm({
        namaLengkap: user?.namaLengkap || "",
        namaPengguna: user?.namaPengguna || "",
        email: user?.email || "",
        noTelepon: user?.noTelepon || "",
        nip: user?.nip || "",
        nuptk: user?.nuptk || "",
        nipd: user?.nipd || "",
        nisn: user?.nisn || "",
        nik: user?.nik || "",
        jenisKelamin: user?.jenisKelamin || "",
        tempatLahir: user?.tempatLahir || "",
        tanggalLahir: toDateInput(user?.tanggalLahir),
        alamat: user?.alamat || "",
        jabatan: user?.jabatan || "",
        golongan: user?.golongan || "",
        status: user?.status || "aktif",
        kategoriJabatanId: kategoriId,
        shiftKerjaId: shiftId,
      });
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  /* =======================================================
     HANDLERS
  ======================================================= */
  function handleChange(event) {
    const { name, value } = event.target;
    setForm((previous) => ({ ...previous, [name]: value }));
    setError("");
    setSuccess("");
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (!id) {
      setError("ID pengguna tidak ditemukan.");
      return;
    }

    const namaLengkap = form.namaLengkap.trim();
    const namaPengguna = form.namaPengguna.trim();
    const email = form.email.trim();

    if (!namaLengkap || !namaPengguna || !email) {
      setError("Nama lengkap, username, dan email wajib diisi.");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Format email tidak valid.");
      return;
    }

    if (!isSiswa && !form.kategoriJabatanId) {
      setError("Kategori jabatan wajib dipilih.");
      return;
    }

    if (isGuru && !form.shiftKerjaId) {
      setError("Shift kerja guru wajib dipilih.");
      return;
    }

    const payload = {
      namaLengkap,
      namaPengguna,
      email,
      noTelepon: form.noTelepon.trim() || null,
      nip: form.nip.trim() || null,
      nuptk: form.nuptk.trim() || null,
      nipd: form.nipd.trim() || null,
      nisn: form.nisn.trim() || null,
      nik: form.nik.trim() || null,
      jenisKelamin: form.jenisKelamin || null,
      tempatLahir: form.tempatLahir.trim() || null,
      tanggalLahir: form.tanggalLahir || null,
      alamat: form.alamat.trim() || null,
      jabatan: form.jabatan.trim() || null,
      golongan: form.golongan.trim() || null,
      status: form.status,
    };

    setSaving(true);

    try {
      const profileResponse = await updateUser(String(id), payload);

      if (profileResponse?.success === false) {
        throw new Error(
          profileResponse?.message || "Gagal menyimpan profil pengguna."
        );
      }

      if (!isSiswa) {
        const shiftIdToSave = isGuru
          ? form.shiftKerjaId
          : form.shiftKerjaId || null;

        await assignUserShiftAndJabatan({
          penggunaId: String(id),
          kategoriJabatanId: String(form.kategoriJabatanId),
          shiftKerjaId: shiftIdToSave ? String(shiftIdToSave) : null,
        });
      }

      router.replace(`/admin/pengguna/kelola-user/${id}`);
      router.refresh();
    } catch (err) {
      console.error("Gagal memperbarui pengguna:", err);
      setError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  /* =======================================================
     FIELD RENDERER
  ======================================================= */
  function field(name, label, options = {}) {
    return (
      <div key={name}>
        <label className={labelClass} htmlFor={name}>
          {label}
          {options.required && (
            <span className="ml-1 text-[var(--color-danger)]">*</span>
          )}
        </label>

        {options.type === "select" ? (
          <select
            id={name}
            name={name}
            value={form[name]}
            onChange={handleChange}
            required={options.required}
            className={inputClass}
          >
            {(options.options || []).map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        ) : options.type === "textarea" ? (
          <textarea
            id={name}
            name={name}
            value={form[name]}
            onChange={handleChange}
            rows={3}
            className={`${inputClass} resize-y`}
            placeholder={`Masukkan ${label.toLowerCase()}`}
          />
        ) : (
          <input
            id={name}
            name={name}
            type={options.type || "text"}
            value={form[name]}
            onChange={handleChange}
            required={options.required}
            className={inputClass}
            placeholder={`Masukkan ${label.toLowerCase()}`}
          />
        )}
      </div>
    );
  }

  /* =======================================================
     OPTIONS
  ======================================================= */
  const kategoriSelectOptions = [
    { value: "", label: "Pilih kategori jabatan" },
    ...kategoriOptions.map((item) => ({
      value: String(item.id),
      label: `${item.nama || item.namaKategori || item.namaJabatan || "Kategori"}${
        String(item.status).toLowerCase() === "nonaktif"
          ? " (Nonaktif)"
          : ""
      }`,
    })),
  ];

  const shiftSelectOptions = [
    { value: "", label: "Pilih shift kerja" },
    ...shiftOptions.map((item) => ({
      value: String(item.id),
      label: getShiftLabel(item),
    })),
  ];

  /* =======================================================
     RENDER
  ======================================================= */
  return (
    <div className="flex h-screen w-full overflow-hidden theme-page">
      <Sidebar />

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <div className="shrink-0">
          <Header />
        </div>

        <main className="min-w-0 flex-1 overflow-y-auto">
          <div className="w-full px-4 py-6 sm:px-6 lg:px-8">
            {/* BACK */}
            <button
              type="button"
              onClick={() =>
                router.push(`/admin/pengguna/kelola-user`)
              }
              className="mb-5 inline-flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm font-medium theme-text-secondary transition hover:theme-card-soft"
            >
              <ArrowLeft size={17} /> Kembali ke detail pengguna
            </button>

            {/* HEADER */}
            <div className="mb-6">
              <p className="text-xs font-semibold uppercase tracking-wide theme-primary-text">
                Manajemen Pengguna
              </p>
              <h1 className="mt-1 text-2xl font-bold tracking-tight theme-text sm:text-3xl">
                Edit Pengguna
              </h1>
              <p className="mt-2 text-sm theme-text-muted">
                Perbarui informasi akun dan data pengguna SmartSchool.
              </p>
            </div>

            {/* ALERTS */}
            {error && (
              <div
                role="alert"
                className="theme-danger mb-5 flex items-start gap-3 rounded-xl border theme-border p-4 text-sm"
              >
                <AlertCircle size={19} className="mt-0.5 shrink-0" />
                <span className="flex-1">{error}</span>
              </div>
            )}

            {success && (
              <div
                role="status"
                className="theme-success mb-5 flex items-start gap-3 rounded-xl border theme-border p-4 text-sm"
              >
                <CheckCircle2 size={19} className="shrink-0" />
                <span className="flex-1">{success}</span>
              </div>
            )}

            {/* LOADING */}
            {loading ? (
              <div className="theme-card flex min-h-64 items-center justify-center rounded-2xl border theme-border">
                <Loader2 size={20} className="animate-spin theme-primary-text" />
                <span className="ml-3 text-sm theme-text-muted">
                  Memuat data pengguna...
                </span>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                {/* SECTION: INFORMASI AKUN */}
                <section className="theme-card overflow-hidden rounded-2xl border theme-border shadow-sm">
                  <div className="flex items-center gap-3 border-b theme-border px-5 py-4 sm:px-6">
                    <div className="theme-primary-soft flex h-10 w-10 shrink-0 items-center justify-center rounded-xl">
                      <UserRound size={18} />
                    </div>
                    <div>
                      <h2 className="text-sm font-semibold theme-text">
                        Informasi Akun
                      </h2>
                      <p className="text-xs theme-text-muted">
                        Identitas dasar pengguna.
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-5 p-5 sm:grid-cols-2 sm:p-6">
                    {field("namaLengkap", "Nama lengkap", { required: true })}
                    {field("namaPengguna", "Username", { required: true })}
                    {field("email", "Email", {
                      type: "email",
                      required: true,
                    })}
                    {field("noTelepon", "Nomor telepon", { type: "tel" })}

                    {field("status", "Status akun", {
                      type: "select",
                      options: [
                        { value: "aktif", label: "Aktif" },
                        { value: "nonaktif", label: "Nonaktif" },
                      ],
                    })}

                    <div>
                      <label className={labelClass}>Peran pengguna</label>
                      <div
                        className={`${inputClass} flex items-center theme-card-soft`}
                      >
                        <ShieldCheck
                          size={16}
                          className="mr-2 theme-primary-text"
                        />
                        <span className="theme-text">
                          {userRole.replace(/_/g, " ") || "-"}
                        </span>
                      </div>
                      <p className="mt-1 text-xs theme-text-muted">
                        Peran tidak diubah dari formulir ini.
                      </p>
                    </div>

                    <div className="sm:col-span-2">
                      <label className={labelClass}>Sekolah</label>
                      <div
                        className={`${inputClass} theme-card-soft`}
                      >
                        {schoolName}
                      </div>
                    </div>
                  </div>
                </section>

                {/* SECTION: KEPEGAWAIAN */}
                <section className="theme-card overflow-hidden rounded-2xl border theme-border shadow-sm">
                  <div className="flex items-center gap-3 border-b theme-border px-5 py-4 sm:px-6">
                    <div className="theme-info flex h-10 w-10 shrink-0 items-center justify-center rounded-xl">
                      <BriefcaseBusiness size={18} />
                    </div>
                    <div>
                      <h2 className="text-sm font-semibold theme-text">
                        Data Kepegawaian dan Identitas
                      </h2>
                      <p className="text-xs theme-text-muted">
                        Informasi administrasi dan penempatan kerja.
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-5 p-5 sm:grid-cols-2 sm:p-6">
                    {field("nip", "NIP")}
                    {field("nuptk", "NUPTK")}
                    {field("nipd", "NIPD")}
                    {field("nisn", "NISN")}
                    {field("nik", "NIK")}

                    {!isSiswa && (
                      <div>
                        <label
                          className={labelClass}
                          htmlFor="kategoriJabatanId"
                        >
                          Kategori jabatan{" "}
                          <span className="text-[var(--color-danger)]">*</span>
                        </label>
                        <select
                          id="kategoriJabatanId"
                          name="kategoriJabatanId"
                          value={form.kategoriJabatanId}
                          onChange={handleChange}
                          required
                          className={inputClass}
                        >
                          {kategoriSelectOptions.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                        <p className="mt-1 text-xs theme-text-muted">
                          Pilihan berasal dari master kategori jabatan.
                        </p>
                      </div>
                    )}

                    {field("jabatan", "Jabatan (data profil lama)")}
                    {field("golongan", "Golongan")}

                    {field("jenisKelamin", "Jenis kelamin", {
                      type: "select",
                      options: [
                        { value: "", label: "Pilih jenis kelamin" },
                        { value: "L", label: "Laki-laki" },
                        { value: "P", label: "Perempuan" },
                      ],
                    })}

                    {field("tempatLahir", "Tempat lahir")}
                    {field("tanggalLahir", "Tanggal lahir", { type: "date" })}

                    {isGuru && (
                      <div>
                        <label className={labelClass} htmlFor="shiftKerjaId">
                          Shift kerja{" "}
                          <span className="text-[var(--color-danger)]">*</span>
                        </label>
                        <select
                          id="shiftKerjaId"
                          name="shiftKerjaId"
                          value={form.shiftKerjaId}
                          onChange={handleChange}
                          required
                          className={inputClass}
                        >
                          {shiftSelectOptions.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                        <p className="mt-1 text-xs theme-text-muted">
                          Pilihan berasal dari master shift kerja.
                        </p>
                      </div>
                    )}
                  </div>
                </section>

                {/* SECTION: ALAMAT */}
                <section className="theme-card overflow-hidden rounded-2xl border theme-border shadow-sm">
                  <div className="flex items-center gap-3 border-b theme-border px-5 py-4 sm:px-6">
                    <div className="theme-success flex h-10 w-10 shrink-0 items-center justify-center rounded-xl">
                      <MapPin size={18} />
                    </div>
                    <div>
                      <h2 className="text-sm font-semibold theme-text">
                        Informasi Alamat
                      </h2>
                      <p className="text-xs theme-text-muted">
                        Alamat yang tersimpan pada akun pengguna.
                      </p>
                    </div>
                  </div>
                  <div className="p-5 sm:p-6">
                    {field("alamat", "Alamat", { type: "textarea" })}
                  </div>
                </section>

                {/* ACTIONS */}
                <div className="flex flex-col-reverse gap-3 pb-2 sm:flex-row sm:justify-end">
                  <button
                    type="button"
                    onClick={() =>
                      router.push(`/admin/pengguna/kelola-user/${id}`)
                    }
                    disabled={saving}
                    className="theme-card theme-border rounded-xl border px-5 py-2.5 text-sm font-semibold theme-text-secondary transition hover:theme-card-soft disabled:opacity-50"
                  >
                    Batal
                  </button>

                  <button
                    type="submit"
                    disabled={saving}
                    className="theme-primary inline-flex items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold shadow-sm transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {saving ? (
                      <Loader2 size={17} className="animate-spin" />
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