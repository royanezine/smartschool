"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import Sidebar from "../../../../components/Sidebar";
import Header from "../../../../components/Header";

import {
  ArrowLeft,
  Save,
  RefreshCw,
  User,
  Mail,
  ShieldCheck,
  Building2,
  Landmark,
  BriefcaseBusiness,
  GraduationCap,
  Users,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";

import {
  getUserById,
  updateUser,
} from "../../../../../services/user.service";

export default function EditUserPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const userId = searchParams.get("id");

  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [form, setForm] = useState({
    email: "",
    namaPengguna: "",
    namaLengkap: "",
    kataSandi: "",
    peranId: "",
    sekolahId: "",
    yayasanId: "",
    jenisKelamin: "",
    nip: "",
    nipd: "",
    nisn: "",
    jabatan: "",
    golongan: "",
    status: "aktif",
  });

  /* =========================================================
     LOAD USER
  ========================================================= */

  useEffect(() => {
    if (!userId) {
      setError("ID pengguna tidak ditemukan.");
      setLoading(false);
      return;
    }

    loadUser();
  }, [userId]);

  const loadUser = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await getUserById(userId);

      const user = response?.data;

      if (!user) {
        throw new Error("Data pengguna tidak ditemukan.");
      }

      setForm({
        email: user.email || "",
        namaPengguna:
          user.namaPengguna ||
          user.username ||
          "",
        namaLengkap:
          user.namaLengkap ||
          user.nama ||
          "",
        kataSandi: "",
        peranId:
          user.peranId ||
          user.peran?.id ||
          "",
        sekolahId:
          user.sekolahId ||
          user.sekolah?.id ||
          "",
        yayasanId:
          user.yayasanId ||
          user.yayasan?.id ||
          "",
        jenisKelamin:
          user.jenisKelamin || "",
        nip: user.nip || "",
        nipd: user.nipd || "",
        nisn: user.nisn || "",
        jabatan:
          user.jabatan || "",
        golongan:
          user.golongan || "",
        status:
          user.status || "aktif",
      });
    } catch (err) {
      console.error(
        "Gagal mengambil detail user:",
        err
      );

      setError(
        err?.message ||
          "Gagal mengambil data pengguna."
      );
    } finally {
      setLoading(false);
    }
  };

  /* =========================================================
     HANDLE FORM
  ========================================================= */

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  /* =========================================================
     SUBMIT
  ========================================================= */

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!userId) {
      setError("ID pengguna tidak ditemukan.");
      return;
    }

    if (!form.namaLengkap.trim()) {
      setError("Nama lengkap wajib diisi.");
      return;
    }

    if (!form.email.trim()) {
      setError("Email wajib diisi.");
      return;
    }

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      const payload = {
        email: form.email.trim(),
        namaPengguna:
          form.namaPengguna.trim() || undefined,
        namaLengkap:
          form.namaLengkap.trim(),

        peranId:
          form.peranId.trim() || null,

        sekolahId:
          form.sekolahId.trim() || null,

        yayasanId:
          form.yayasanId.trim() || null,

        jenisKelamin:
          form.jenisKelamin || null,

        nip:
          form.nip.trim() || null,

        nipd:
          form.nipd.trim() || null,

        nisn:
          form.nisn.trim() || null,

        jabatan:
          form.jabatan.trim() || null,

        golongan:
          form.golongan.trim() || null,

        status:
          form.status,
      };

      /*
       * Password hanya dikirim jika user
       * memang mengisinya.
       */
      if (form.kataSandi.trim()) {
        payload.kataSandi =
          form.kataSandi.trim();
      }

      await updateUser(
        userId,
        payload
      );

      setSuccess(
        "Data pengguna berhasil diperbarui."
      );

      setTimeout(() => {
        router.push(
          "/super-admin/kelola-user"
        );
      }, 800);
    } catch (err) {
      console.error(
        "Gagal memperbarui user:",
        err
      );

      setError(
        err?.message ||
          "Gagal memperbarui data pengguna."
      );
    } finally {
      setSaving(false);
    }
  };

  /* =========================================================
     LOADING
  ========================================================= */

  if (loading) {
    return (
      <div className="flex h-screen overflow-hidden bg-slate-50">
        <Sidebar
          role="super-admin"
          open={sidebarOpen}
          setOpen={setSidebarOpen}
        />

        <div className="flex h-screen flex-1 flex-col overflow-hidden">
          <Header
            onMenuClick={() =>
              setSidebarOpen(true)
            }
            notifications={[]}
            user={{
              name: "Super Admin",
              email:
                "admin@smartschool.com",
              avatar: "SA",
            }}
          />

          <main className="flex flex-1 items-center justify-center">
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50">
                <RefreshCw className="h-5 w-5 animate-spin text-blue-600" />
              </div>

              <p className="text-sm font-semibold text-slate-700">
                Memuat data pengguna...
              </p>

              <p className="mt-1 text-xs text-slate-400">
                Mengambil data dari server
                SmartSchool.
              </p>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      <Sidebar
        role="super-admin"
        open={sidebarOpen}
        setOpen={setSidebarOpen}
      />

      <div className="flex h-screen flex-1 flex-col overflow-hidden">
        <Header
          onMenuClick={() =>
            setSidebarOpen(true)
          }
          notifications={[]}
          user={{
            name: "Super Admin",
            email:
              "admin@smartschool.com",
            avatar: "SA",
          }}
        />

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="mx-auto w-full max-w-[1200px]">

            {/* =================================================
                HEADER
            ================================================= */}

            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <button
                  type="button"
                  onClick={() =>
                    router.push(
                      "/super-admin/kelola-user"
                    )
                  }
                  className="mb-3 inline-flex items-center gap-2 text-sm font-semibold text-slate-500 transition hover:text-blue-600"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Kembali ke Kelola User
                </button>

                <h1 className="text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">
                  Edit Pengguna
                </h1>

                <p className="mt-1 text-sm text-slate-500">
                  Perbarui informasi akun
                  pengguna SmartSchool.
                </p>
              </div>
            </div>

            {/* =================================================
                ALERT ERROR
            ================================================= */}

            {error && (
              <div className="mb-6 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-red-100">
                  <AlertCircle className="h-5 w-5 text-red-600" />
                </div>

                <div>
                  <p className="font-semibold text-red-800">
                    Terjadi kesalahan
                  </p>

                  <p className="mt-1 text-sm text-red-700">
                    {error}
                  </p>
                </div>
              </div>
            )}

            {/* =================================================
                SUCCESS
            ================================================= */}

            {success && (
              <div className="mb-6 flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-100">
                  <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                </div>

                <div>
                  <p className="font-semibold text-emerald-800">
                    Berhasil
                  </p>

                  <p className="mt-1 text-sm text-emerald-700">
                    {success}
                  </p>
                </div>
              </div>
            )}

            {/* =================================================
                FORM
            ================================================= */}

            <form
              onSubmit={handleSubmit}
              className="space-y-6"
            >

              {/* AKUN */}

              <section className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
                <div className="border-b border-slate-100 px-6 py-5">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                      <User className="h-5 w-5" />
                    </div>

                    <div>
                      <h2 className="font-bold text-slate-900">
                        Informasi Akun
                      </h2>

                      <p className="mt-0.5 text-xs text-slate-500">
                        Data utama akun pengguna.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-5 p-6 md:grid-cols-2">

                  <FormInput
                    label="Nama Lengkap"
                    name="namaLengkap"
                    value={
                      form.namaLengkap
                    }
                    onChange={
                      handleChange
                    }
                    placeholder="Masukkan nama lengkap"
                    icon={User}
                    required
                  />

                  <FormInput
                    label="Username"
                    name="namaPengguna"
                    value={
                      form.namaPengguna
                    }
                    onChange={
                      handleChange
                    }
                    placeholder="Masukkan username"
                    icon={User}
                  />

                  <FormInput
                    label="Email"
                    name="email"
                    type="email"
                    value={form.email}
                    onChange={
                      handleChange
                    }
                    placeholder="contoh@email.com"
                    icon={Mail}
                    required
                  />

                  <FormInput
                    label="Password Baru"
                    name="kataSandi"
                    type="password"
                    value={
                      form.kataSandi
                    }
                    onChange={
                      handleChange
                    }
                    placeholder="Kosongkan jika tidak diubah"
                    icon={ShieldCheck}
                  />

                </div>
              </section>

              {/* ROLE */}

              <section className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
                <div className="border-b border-slate-100 px-6 py-5">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                      <ShieldCheck className="h-5 w-5" />
                    </div>

                    <div>
                      <h2 className="font-bold text-slate-900">
                        Role & Akses
                      </h2>

                      <p className="mt-0.5 text-xs text-slate-500">
                        Pengaturan role dan status
                        akun pengguna.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-5 p-6 md:grid-cols-2">

                  <FormInput
                    label="Role ID"
                    name="peranId"
                    value={form.peranId}
                    onChange={
                      handleChange
                    }
                    placeholder="ID role"
                    icon={ShieldCheck}
                  />

                  <FormSelect
                    label="Status"
                    name="status"
                    value={form.status}
                    onChange={
                      handleChange
                    }
                    icon={CheckCircle2}
                    options={[
                      {
                        value: "aktif",
                        label: "Aktif",
                      },
                      {
                        value: "nonaktif",
                        label: "Nonaktif",
                      },
                    ]}
                  />

                </div>
              </section>

              {/* SEKOLAH / YAYASAN */}

              <section className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
                <div className="border-b border-slate-100 px-6 py-5">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                      <Building2 className="h-5 w-5" />
                    </div>

                    <div>
                      <h2 className="font-bold text-slate-900">
                        Relasi Sekolah & Yayasan
                      </h2>

                      <p className="mt-0.5 text-xs text-slate-500">
                        Hubungan akun dengan sekolah
                        atau yayasan.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-5 p-6 md:grid-cols-2">

                  <FormInput
                    label="Sekolah ID"
                    name="sekolahId"
                    value={
                      form.sekolahId
                    }
                    onChange={
                      handleChange
                    }
                    placeholder="ID sekolah"
                    icon={Building2}
                  />

                  <FormInput
                    label="Yayasan ID"
                    name="yayasanId"
                    value={
                      form.yayasanId
                    }
                    onChange={
                      handleChange
                    }
                    placeholder="ID yayasan"
                    icon={Landmark}
                  />

                </div>
              </section>

              {/* DATA IDENTITAS */}

              <section className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
                <div className="border-b border-slate-100 px-6 py-5">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-50 text-orange-600">
                      <GraduationCap className="h-5 w-5" />
                    </div>

                    <div>
                      <h2 className="font-bold text-slate-900">
                        Data Identitas
                      </h2>

                      <p className="mt-0.5 text-xs text-slate-500">
                        Informasi identitas dan data
                        kepegawaian pengguna.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-5 p-6 md:grid-cols-2">

                  <FormSelect
                    label="Jenis Kelamin"
                    name="jenisKelamin"
                    value={
                      form.jenisKelamin
                    }
                    onChange={
                      handleChange
                    }
                    icon={Users}
                    options={[
                      {
                        value: "",
                        label:
                          "Pilih jenis kelamin",
                      },
                      {
                        value: "L",
                        label:
                          "Laki-laki",
                      },
                      {
                        value: "P",
                        label:
                          "Perempuan",
                      },
                    ]}
                  />

                  <FormInput
                    label="NIP"
                    name="nip"
                    value={form.nip}
                    onChange={
                      handleChange
                    }
                    placeholder="Nomor Induk Pegawai"
                    icon={BriefcaseBusiness}
                  />

                  <FormInput
                    label="NIPD"
                    name="nipd"
                    value={form.nipd}
                    onChange={
                      handleChange
                    }
                    placeholder="Nomor Induk Peserta Didik"
                    icon={GraduationCap}
                  />

                  <FormInput
                    label="NISN"
                    name="nisn"
                    value={form.nisn}
                    onChange={
                      handleChange
                    }
                    placeholder="Nomor Induk Siswa Nasional"
                    icon={GraduationCap}
                  />

                  <FormInput
                    label="Jabatan"
                    name="jabatan"
                    value={
                      form.jabatan
                    }
                    onChange={
                      handleChange
                    }
                    placeholder="Contoh: Guru"
                    icon={BriefcaseBusiness}
                  />

                  <FormInput
                    label="Golongan"
                    name="golongan"
                    value={
                      form.golongan
                    }
                    onChange={
                      handleChange
                    }
                    placeholder="Contoh: III/a"
                    icon={BriefcaseBusiness}
                  />

                </div>
              </section>

              {/* BUTTON */}

              <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={() =>
                    router.push(
                      "/super-admin/kelola-user"
                    )
                  }
                  disabled={saving}
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Batal
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 text-sm font-bold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      Menyimpan...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4" />
                      Simpan Perubahan
                    </>
                  )}
                </button>
              </div>

            </form>
          </div>
        </main>
      </div>
    </div>
  );
}

/* =========================================================
   FORM INPUT
========================================================= */

function FormInput({
  label,
  name,
  value,
  onChange,
  placeholder,
  type = "text",
  icon: Icon,
  required = false,
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-semibold text-slate-700">
        {label}

        {required && (
          <span className="ml-1 text-red-500">
            *
          </span>
        )}
      </label>

      <div className="relative">
        {Icon && (
          <Icon className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        )}

        <input
          type={type}
          name={name}
          value={value || ""}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          className={`h-11 w-full rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-50 ${
            Icon
              ? "pl-10 pr-4"
              : "px-4"
          }`}
        />
      </div>
    </div>
  );
}

/* =========================================================
   FORM SELECT
========================================================= */

function FormSelect({
  label,
  name,
  value,
  onChange,
  options,
  icon: Icon,
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-semibold text-slate-700">
        {label}
      </label>

      <div className="relative">
        {Icon && (
          <Icon className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        )}

        <select
          name={name}
          value={value || ""}
          onChange={onChange}
          className={`h-11 w-full appearance-none rounded-xl border border-slate-200 bg-slate-50 pr-10 text-sm text-slate-800 outline-none transition hover:border-slate-300 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-50 ${
            Icon
              ? "pl-10"
              : "pl-4"
          }`}
        >
          {options.map(
            (option) => (
              <option
                key={option.value}
                value={option.value}
              >
                {option.label}
              </option>
            )
          )}
        </select>

        <span className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400">
          ▾
        </span>
      </div>
    </div>
  );
}