
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
  "w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:border-blue-400 dark:focus:ring-blue-900/40";

const labelClass =
  "mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-200";

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
    user?.peran?.nama ||
      user?.peran?.namaTampilan ||
      user?.role ||
      ""
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
    user?.kategoriJabatanId ??
      user?.kategoriJabatan?.id ??
      ""
  );
}

function getShiftId(user) {
  return String(
    user?.shiftKerjaId ??
      user?.shiftKerjaMaster?.id ??
      ""
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

      // Pertahankan pilihan yang sudah tersimpan jika tidak ada
      // dalam daftar aktif yang dikembalikan oleh endpoint master.
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
        // Pertahankan shift yang ada untuk pengguna non-guru,
        // karena field shift tidak ditampilkan kepada mereka.
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

  function field(name, label, options = {}) {
    return (
      <div key={name}>
        <label className={labelClass} htmlFor={name}>
          {label}
          {options.required && <span className="ml-1 text-red-500">*</span>}
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
            className={inputClass}
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

  const kategoriSelectOptions = [
    { value: "", label: "Pilih kategori jabatan" },
    ...kategoriOptions.map((item) => ({
      value: String(item.id),
      label: `${item.nama || item.namaKategori || item.namaJabatan || "Kategori"}${
        String(item.status).toLowerCase() === "nonaktif" ? " (Nonaktif)" : ""
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

  return (
    <div className="flex h-screen w-full overflow-hidden bg-slate-50 text-slate-800 dark:bg-slate-950 dark:text-slate-100">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <div className="shrink-0"><Header /></div>

        <main className="flex-1 overflow-y-auto">
          <div className="mx-auto w-full max-w-7xl p-4 sm:p-6 lg:p-8">
            <button
              type="button"
              onClick={() => router.push(`/admin/pengguna/kelola-user/${id}`)}
              className="mb-5 inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-200/70 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              <ArrowLeft size={17} /> Kembali ke detail pengguna
            </button>

            <div className="mb-6">
              <p className="text-sm font-medium text-blue-600 dark:text-blue-400">
                Manajemen Pengguna
              </p>
              <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
                Edit Pengguna
              </h1>
              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                Perbarui informasi akun dan data pengguna SmartSchool.
              </p>
            </div>

            {error && (
              <div role="alert" className="mb-5 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300">
                <AlertCircle size={19} className="mt-0.5 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {success && (
              <div className="mb-5 flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300">
                <CheckCircle2 size={19} /><span>{success}</span>
              </div>
            )}

            {loading ? (
              <div className="flex min-h-64 items-center justify-center rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
                <Loader2 size={20} className="animate-spin" />
                <span className="ml-3 text-sm text-slate-500">Memuat data pengguna...</span>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
                  <div className="flex items-center gap-3 border-b border-slate-100 px-5 py-4 dark:border-slate-800 sm:px-6">
                    <div className="rounded-xl bg-blue-50 p-2.5 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400"><UserRound size={20} /></div>
                    <div>
                      <h2 className="font-semibold text-slate-900 dark:text-white">Informasi Akun</h2>
                      <p className="text-sm text-slate-500 dark:text-slate-400">Identitas dasar pengguna.</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-5 p-5 sm:grid-cols-2 sm:p-6">
                    {field("namaLengkap", "Nama lengkap", { required: true })}
                    {field("namaPengguna", "Username", { required: true })}
                    {field("email", "Email", { type: "email", required: true })}
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
                      <div className={`${inputClass} flex items-center bg-slate-50 dark:bg-slate-800`}>
                        <ShieldCheck size={17} className="mr-2 text-blue-500" />
                        {userRole.replace(/_/g, " ") || "-"}
                      </div>
                      <p className="mt-1 text-xs text-slate-500">Peran tidak diubah dari formulir ini.</p>
                    </div>

                    <div className="sm:col-span-2">
                      <label className={labelClass}>Sekolah</label>
                      <div className={`${inputClass} bg-slate-50 dark:bg-slate-800`}>{schoolName}</div>
                    </div>
                  </div>
                </section>

                <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
                  <div className="flex items-center gap-3 border-b border-slate-100 px-5 py-4 dark:border-slate-800 sm:px-6">
                    <div className="rounded-xl bg-indigo-50 p-2.5 text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-400"><BriefcaseBusiness size={20} /></div>
                    <div>
                      <h2 className="font-semibold text-slate-900 dark:text-white">Data Kepegawaian dan Identitas</h2>
                      <p className="text-sm text-slate-500 dark:text-slate-400">Informasi administrasi dan penempatan kerja.</p>
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
                        <label className={labelClass} htmlFor="kategoriJabatanId">
                          Kategori jabatan <span className="text-red-500">*</span>
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
                            <option key={option.value} value={option.value}>{option.label}</option>
                          ))}
                        </select>
                        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Pilihan berasal dari master kategori jabatan.</p>
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
                          Shift kerja <span className="text-red-500">*</span>
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
                            <option key={option.value} value={option.value}>{option.label}</option>
                          ))}
                        </select>
                        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Pilihan berasal dari master shift kerja.</p>
                      </div>
                    )}
                  </div>
                </section>

                <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
                  <div className="flex items-center gap-3 border-b border-slate-100 px-5 py-4 dark:border-slate-800 sm:px-6">
                    <div className="rounded-xl bg-emerald-50 p-2.5 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400"><MapPin size={20} /></div>
                    <div>
                      <h2 className="font-semibold text-slate-900 dark:text-white">Informasi Alamat</h2>
                      <p className="text-sm text-slate-500 dark:text-slate-400">Alamat yang tersimpan pada akun pengguna.</p>
                    </div>
                  </div>
                  <div className="p-5 sm:p-6">{field("alamat", "Alamat", { type: "textarea" })}</div>
                </section>

                <div className="flex flex-col-reverse gap-3 pb-2 sm:flex-row sm:justify-end">
                  <button
                    type="button"
                    onClick={() => router.push(`/admin/pengguna/kelola-user/${id}`)}
                    disabled={saving}
                    className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-100 disabled:opacity-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {saving ? <Loader2 size={17} className="animate-spin" /> : <Save size={17} />}
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
