"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  UserPlus,
  Save,
  Loader2,
  User,
  Mail,
  CreditCard,
  Users,
  MapPin,
  BriefcaseBusiness,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";

import Header from "../../../components/Header";
import Sidebar from "../../../components/Sidebar";

import { createSiswa } from "../../../../services/siswa.service";

export default function TambahSiswaPage() {
  const router = useRouter();

  const [isCollapsed, setIsCollapsed] =
    useState(false);

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  const [form, setForm] = useState({
    namaLengkap: "",
    email: "",
    nisn: "",
    nis: "",
    kelasId: "",
    nik: "",

    namaAyah: "",
    pekerjaanAyah: "",

    namaIbu: "",
    pekerjaanIbu: "",

    alamatKtp: "",
    alamatDomisili: "",

    kecamatan: "",
    kelurahan: "",
    kota: "",
  });

  // =========================================================
  // HANDLE INPUT
  // =========================================================
  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));

    setError("");
    setSuccess("");
  };

  // =========================================================
  // HANDLE SUBMIT
  // =========================================================
  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    // ---------------------------------------------
    // VALIDASI FRONTEND
    // ---------------------------------------------
    if (!form.namaLengkap.trim()) {
      setError(
        "Nama lengkap wajib diisi."
      );
      return;
    }

    if (form.namaLengkap.trim().length < 3) {
      setError(
        "Nama lengkap minimal 3 karakter."
      );
      return;
    }

    if (!form.email.trim()) {
      setError(
        "Email wajib diisi."
      );
      return;
    }

    if (!form.nisn.trim()) {
      setError(
        "NISN wajib diisi."
      );
      return;
    }

    if (form.nisn.trim().length < 5) {
      setError(
        "NISN minimal 5 karakter."
      );
      return;
    }

    if (!form.kelasId) {
      setError(
        "Kelas wajib dipilih."
      );
      return;
    }

    try {
      setLoading(true);

      // ---------------------------------------------
      // DATA YANG DIKIRIM KE BACKEND
      // ---------------------------------------------
      const payload = {
        namaLengkap:
          form.namaLengkap.trim(),

        email:
          form.email.trim(),

        nisn:
          form.nisn.trim(),

        nis:
          form.nis.trim() || undefined,

        kelasId:
          form.kelasId,

        nik:
          form.nik.trim() || undefined,

        namaAyah:
          form.namaAyah.trim() || undefined,

        pekerjaanAyah:
          form.pekerjaanAyah.trim() ||
          undefined,

        namaIbu:
          form.namaIbu.trim() || undefined,

        pekerjaanIbu:
          form.pekerjaanIbu.trim() ||
          undefined,

        alamatKtp:
          form.alamatKtp.trim() ||
          undefined,

        alamatDomisili:
          form.alamatDomisili.trim() ||
          undefined,

        kecamatan:
          form.kecamatan.trim() ||
          undefined,

        kelurahan:
          form.kelurahan.trim() ||
          undefined,

        kota:
          form.kota.trim() ||
          undefined,
      };

      console.log(
        "Payload create siswa:",
        payload
      );

      // ---------------------------------------------
      // POST KE BACKEND
      // /api/v1/siswa
      // ---------------------------------------------
      const response =
        await createSiswa(payload);

      console.log(
        "Response create siswa:",
        response
      );

      setSuccess(
        "Data siswa berhasil ditambahkan."
      );

      // ---------------------------------------------
      // KEMBALI KE DATA SISWA
      // ---------------------------------------------
      setTimeout(() => {
        router.push(
          "/admin/siswa"
        );
      }, 800);
    } catch (err) {
      console.error(
        "Error create siswa:",
        err
      );

      setError(
        err?.message ||
          "Gagal menambahkan data siswa."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen w-full overflow-hidden bg-slate-100">

      {/* =====================================================
          SIDEBAR
      ===================================================== */}
      <Sidebar
        active="siswa"
        setActive={() => {}}
        collapsed={isCollapsed}
        setCollapsed={
          setIsCollapsed
        }
      />

      {/* =====================================================
          MAIN
      ===================================================== */}
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">

        {/* HEADER */}
        <Header
          toggleSidebar={() =>
            setIsCollapsed(
              !isCollapsed
            )
          }
          notifications={[]}
          user={{
            name: "Admin Sekolah",
            email:
              "admin@smartschool.com",
            avatar: "AD",
          }}
        />

        {/* CONTENT */}
        <main className="min-h-0 flex-1 overflow-y-auto">

          <div className="w-full px-3 py-4 sm:px-4 md:px-6 lg:px-8 xl:px-10">

            <div className="mx-auto w-full max-w-6xl">

              {/* =================================================
                  TOP HEADER
              ================================================= */}
              <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

                <div className="flex items-center gap-3">

                  <button
                    type="button"
                    onClick={() =>
                      router.push(
                        "/admin/siswa"
                      )
                    }
                    className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-300 bg-white text-slate-600 transition hover:border-blue-400 hover:bg-blue-50 hover:text-blue-600"
                  >
                    <ArrowLeft
                      size={19}
                    />
                  </button>

                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-cyan-600 text-white shadow-lg shadow-blue-200">
                    <UserPlus
                      size={21}
                    />
                  </div>

                  <div>
                    <h1 className="text-xl font-semibold text-slate-800 sm:text-2xl">
                      Tambah Siswa
                    </h1>

                    <p className="text-xs text-slate-600 sm:text-sm">
                      Tambahkan data siswa baru
                    </p>
                  </div>

                </div>

              </div>

              {/* =================================================
                  ERROR
              ================================================= */}
              {error && (
                <div className="mb-5 flex items-start gap-3 rounded-xl border border-rose-200 bg-rose-50 p-4">

                  <AlertCircle
                    size={20}
                    className="mt-0.5 shrink-0 text-rose-600"
                  />

                  <div>
                    <p className="text-sm font-semibold text-rose-700">
                      Gagal menyimpan
                    </p>

                    <p className="mt-1 text-sm text-rose-600">
                      {error}
                    </p>
                  </div>

                </div>
              )}

              {/* =================================================
                  SUCCESS
              ================================================= */}
              {success && (
                <div className="mb-5 flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4">

                  <CheckCircle2
                    size={20}
                    className="mt-0.5 shrink-0 text-emerald-600"
                  />

                  <div>
                    <p className="text-sm font-semibold text-emerald-700">
                      Berhasil
                    </p>

                    <p className="mt-1 text-sm text-emerald-600">
                      {success}
                    </p>
                  </div>

                </div>
              )}

              {/* =================================================
                  FORM
              ================================================= */}
              <form
                onSubmit={
                  handleSubmit
                }
                className="space-y-5"
              >

                {/* =================================================
                    DATA UTAMA
                ================================================= */}
                <section className="overflow-hidden rounded-2xl border border-slate-300 bg-white shadow-sm">

                  <div className="border-b border-slate-200 bg-slate-50 px-5 py-4">

                    <div className="flex items-center gap-3">

                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-100 text-blue-600">
                        <User
                          size={18}
                        />
                      </div>

                      <div>
                        <h2 className="font-semibold text-slate-800">
                          Data Utama
                        </h2>

                        <p className="text-xs text-slate-500">
                          Informasi dasar siswa
                        </p>
                      </div>

                    </div>

                  </div>

                  <div className="grid gap-5 p-5 md:grid-cols-2">

                    {/* NAMA */}
                    <InputField
                      label="Nama Lengkap"
                      name="namaLengkap"
                      value={
                        form.namaLengkap
                      }
                      onChange={
                        handleChange
                      }
                      placeholder="Masukkan nama lengkap"
                      required
                      icon={
                        <User
                          size={17}
                        />
                      }
                    />

                    {/* EMAIL */}
                    <InputField
                      label="Email"
                      name="email"
                      type="email"
                      value={
                        form.email
                      }
                      onChange={
                        handleChange
                      }
                      placeholder="contoh@email.com"
                      required
                      icon={
                        <Mail
                          size={17}
                        />
                      }
                    />

                    {/* NISN */}
                    <InputField
                      label="NISN"
                      name="nisn"
                      value={
                        form.nisn
                      }
                      onChange={
                        handleChange
                      }
                      placeholder="Masukkan NISN"
                      required
                      icon={
                        <CreditCard
                          size={17}
                        />
                      }
                    />

                    {/* NIS */}
                    <InputField
                      label="NIS"
                      name="nis"
                      value={
                        form.nis
                      }
                      onChange={
                        handleChange
                      }
                      placeholder="Masukkan NIS"
                      icon={
                        <CreditCard
                          size={17}
                        />
                      }
                    />

                    {/* KELAS ID */}
                    <div className="md:col-span-2">

                      <label className="mb-1.5 block text-sm font-medium text-slate-700">
                        ID Kelas
                        <span className="ml-1 text-rose-500">
                          *
                        </span>
                      </label>

                      <div className="relative">

                        <Users
                          size={17}
                          className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                        />

                        <input
                          type="text"
                          name="kelasId"
                          value={
                            form.kelasId
                          }
                          onChange={
                            handleChange
                          }
                          placeholder="Masukkan UUID kelas"
                          className="w-full rounded-xl border border-slate-300 bg-white py-2.5 pl-10 pr-4 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                          required
                        />

                      </div>

                      <p className="mt-1.5 text-xs text-slate-500">
                        Isi dengan UUID kelas yang
                        terdaftar di backend.
                      </p>

                    </div>

                    {/* NIK */}
                    <InputField
                      label="NIK"
                      name="nik"
                      value={
                        form.nik
                      }
                      onChange={
                        handleChange
                      }
                      placeholder="Masukkan NIK"
                      icon={
                        <CreditCard
                          size={17}
                        />
                      }
                    />

                  </div>

                </section>

                {/* =================================================
                    DATA AYAH
                ================================================= */}
                <section className="overflow-hidden rounded-2xl border border-slate-300 bg-white shadow-sm">

                  <div className="border-b border-slate-200 bg-slate-50 px-5 py-4">

                    <div className="flex items-center gap-3">

                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-100 text-indigo-600">
                        <Users
                          size={18}
                        />
                      </div>

                      <div>
                        <h2 className="font-semibold text-slate-800">
                          Data Ayah
                        </h2>

                        <p className="text-xs text-slate-500">
                          Informasi orang tua siswa
                        </p>
                      </div>

                    </div>

                  </div>

                  <div className="grid gap-5 p-5 md:grid-cols-2">

                    <InputField
                      label="Nama Ayah"
                      name="namaAyah"
                      value={
                        form.namaAyah
                      }
                      onChange={
                        handleChange
                      }
                      placeholder="Masukkan nama ayah"
                      icon={
                        <User
                          size={17}
                        />
                      }
                    />

                    <InputField
                      label="Pekerjaan Ayah"
                      name="pekerjaanAyah"
                      value={
                        form.pekerjaanAyah
                      }
                      onChange={
                        handleChange
                      }
                      placeholder="Masukkan pekerjaan ayah"
                      icon={
                        <BriefcaseBusiness
                          size={17}
                        />
                      }
                    />

                  </div>

                </section>

                {/* =================================================
                    DATA IBU
                ================================================= */}
                <section className="overflow-hidden rounded-2xl border border-slate-300 bg-white shadow-sm">

                  <div className="border-b border-slate-200 bg-slate-50 px-5 py-4">

                    <div className="flex items-center gap-3">

                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-pink-100 text-pink-600">
                        <Users
                          size={18}
                        />
                      </div>

                      <div>
                        <h2 className="font-semibold text-slate-800">
                          Data Ibu
                        </h2>

                        <p className="text-xs text-slate-500">
                          Informasi orang tua siswa
                        </p>
                      </div>

                    </div>

                  </div>

                  <div className="grid gap-5 p-5 md:grid-cols-2">

                    <InputField
                      label="Nama Ibu"
                      name="namaIbu"
                      value={
                        form.namaIbu
                      }
                      onChange={
                        handleChange
                      }
                      placeholder="Masukkan nama ibu"
                      icon={
                        <User
                          size={17}
                        />
                      }
                    />

                    <InputField
                      label="Pekerjaan Ibu"
                      name="pekerjaanIbu"
                      value={
                        form.pekerjaanIbu
                      }
                      onChange={
                        handleChange
                      }
                      placeholder="Masukkan pekerjaan ibu"
                      icon={
                        <BriefcaseBusiness
                          size={17}
                        />
                      }
                    />

                  </div>

                </section>

                {/* =================================================
                    ALAMAT
                ================================================= */}
                <section className="overflow-hidden rounded-2xl border border-slate-300 bg-white shadow-sm">

                  <div className="border-b border-slate-200 bg-slate-50 px-5 py-4">

                    <div className="flex items-center gap-3">

                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-100 text-emerald-600">
                        <MapPin
                          size={18}
                        />
                      </div>

                      <div>
                        <h2 className="font-semibold text-slate-800">
                          Alamat
                        </h2>

                        <p className="text-xs text-slate-500">
                          Informasi tempat tinggal
                        </p>
                      </div>

                    </div>

                  </div>

                  <div className="grid gap-5 p-5 md:grid-cols-2">

                    {/* ALAMAT KTP */}
                    <TextareaField
                      label="Alamat KTP"
                      name="alamatKtp"
                      value={
                        form.alamatKtp
                      }
                      onChange={
                        handleChange
                      }
                      placeholder="Masukkan alamat sesuai KTP"
                    />

                    {/* ALAMAT DOMISILI */}
                    <TextareaField
                      label="Alamat Domisili"
                      name="alamatDomisili"
                      value={
                        form.alamatDomisili
                      }
                      onChange={
                        handleChange
                      }
                      placeholder="Masukkan alamat domisili"
                    />

                    {/* KECAMATAN */}
                    <InputField
                      label="Kecamatan"
                      name="kecamatan"
                      value={
                        form.kecamatan
                      }
                      onChange={
                        handleChange
                      }
                      placeholder="Masukkan kecamatan"
                    />

                    {/* KELURAHAN */}
                    <InputField
                      label="Kelurahan"
                      name="kelurahan"
                      value={
                        form.kelurahan
                      }
                      onChange={
                        handleChange
                      }
                      placeholder="Masukkan kelurahan"
                    />

                    {/* KOTA */}
                    <InputField
                      label="Kota"
                      name="kota"
                      value={
                        form.kota
                      }
                      onChange={
                        handleChange
                      }
                      placeholder="Masukkan kota"
                    />

                  </div>

                </section>

                {/* =================================================
                    INFO PASSWORD
                ================================================= */}
                <div className="flex items-start gap-3 rounded-xl border border-blue-200 bg-blue-50 p-4">

                  <AlertCircle
                    size={19}
                    className="mt-0.5 shrink-0 text-blue-600"
                  />

                  <div>

                    <p className="text-sm font-semibold text-blue-700">
                      Password akun siswa
                    </p>

                    <p className="mt-1 text-xs leading-relaxed text-blue-600">
                      Berdasarkan backend, password awal
                      siswa akan otomatis dibuat menggunakan
                      NISN yang didaftarkan.
                    </p>

                  </div>

                </div>

                {/* =================================================
                    ACTION
                ================================================= */}
                <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">

                  <button
                    type="button"
                    onClick={() =>
                      router.push(
                        "/admin/siswa"
                      )
                    }
                    disabled={loading}
                    className="rounded-xl border border-slate-300 bg-white px-5 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Batal
                  </button>

                  <button
                    type="submit"
                    disabled={loading}
                    className="flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-blue-700 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-60"
                  >

                    {loading ? (
                      <>
                        <Loader2
                          size={17}
                          className="animate-spin"
                        />

                        Menyimpan...
                      </>
                    ) : (
                      <>
                        <Save
                          size={17}
                        />

                        Simpan Siswa
                      </>
                    )}

                  </button>

                </div>

              </form>

            </div>

          </div>

        </main>

      </div>
    </div>
  );
}

// =========================================================
// INPUT FIELD
// =========================================================
function InputField({
  label,
  name,
  value,
  onChange,
  placeholder,
  required = false,
  type = "text",
  icon = null,
}) {
  return (
    <div>

      <label className="mb-1.5 block text-sm font-medium text-slate-700">

        {label}

        {required && (
          <span className="ml-1 text-rose-500">
            *
          </span>
        )}

      </label>

      <div className="relative">

        {icon && (
          <div className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
            {icon}
          </div>
        )}

        <input
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          className={`w-full rounded-xl border border-slate-300 bg-white py-2.5 ${
            icon
              ? "pl-10"
              : "pl-4"
          } pr-4 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20`}
        />

      </div>

    </div>
  );
}

// =========================================================
// TEXTAREA FIELD
// =========================================================
function TextareaField({
  label,
  name,
  value,
  onChange,
  placeholder,
  required = false,
}) {
  return (
    <div>

      <label className="mb-1.5 block text-sm font-medium text-slate-700">

        {label}

        {required && (
          <span className="ml-1 text-rose-500">
            *
          </span>
        )}

      </label>

      <textarea
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        rows={4}
        className="w-full resize-none rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
      />

    </div>
  );
}