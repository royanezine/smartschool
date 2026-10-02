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

import Header from "../../../../components/Header";
import Sidebar from "../../../../components/Sidebar";

import { createSiswa } from "../../../../../services/siswa.service";

/* =========================================================
   THEME HELPERS
========================================================= */

const themePrimaryGradient =
  "bg-[linear-gradient(135deg,var(--color-primary),color-mix(in_srgb,var(--color-primary)_72%,var(--color-info)))]";

const themePrimaryShadow =
  "shadow-[0_8px_20px_color-mix(in_srgb,var(--color-primary)_18%,transparent)]";

const themeCardShadow =
  "shadow-[0_4px_18px_color-mix(in_srgb,var(--color-text)_5%,transparent)]";

const themeSmallShadow =
  "shadow-[0_2px_8px_color-mix(in_srgb,var(--color-text)_5%,transparent)]";

const themeNeutralSurface =
  "bg-[color-mix(in_srgb,var(--color-text)_4%,transparent)]";

const themeNeutralHover =
  "hover:bg-[color-mix(in_srgb,var(--color-text)_7%,transparent)]";

const themeNeutralBorder =
  "border-[color-mix(in_srgb,var(--color-text)_10%,transparent)]";

const themeDivider =
  "border-[color-mix(in_srgb,var(--color-text)_8%,transparent)]";

const themePrimarySurface =
  "bg-[color-mix(in_srgb,var(--color-primary)_9%,transparent)]";

const themePrimaryBorder =
  "border-[color-mix(in_srgb,var(--color-primary)_22%,transparent)]";

const themeSuccessSurface =
  "bg-[color-mix(in_srgb,var(--color-success)_9%,transparent)]";

const themeSuccessBorder =
  "border-[color-mix(in_srgb,var(--color-success)_24%,transparent)]";

const themeWarningSurface =
  "bg-[color-mix(in_srgb,var(--color-warning)_9%,transparent)]";

const themeWarningBorder =
  "border-[color-mix(in_srgb,var(--color-warning)_24%,transparent)]";

const themeInfoSurface =
  "bg-[color-mix(in_srgb,var(--color-info)_9%,transparent)]";

const themeInfoBorder =
  "border-[color-mix(in_srgb,var(--color-info)_24%,transparent)]";

const themeFocus =
  "focus:border-[var(--color-primary)] focus:bg-[var(--color-card)] focus:ring-2 focus:ring-[color-mix(in_srgb,var(--color-primary)_14%,transparent)]";

/* =========================================================
   MAIN PAGE
========================================================= */

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
    <div className="flex h-screen w-full overflow-hidden theme-page">

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
                    className={`flex h-10 w-10 items-center justify-center rounded-xl border ${themeNeutralBorder} theme-card theme-text-secondary transition ${themeNeutralHover} hover:text-[var(--color-primary)]`}
                  >
                    <ArrowLeft
                      size={19}
                    />
                  </button>

                  <div
                    className={`flex h-11 w-11 items-center justify-center rounded-xl ${themePrimaryGradient} text-[var(--color-card)] ${themePrimaryShadow}`}
                  >
                    <UserPlus
                      size={21}
                    />
                  </div>

                  <div>

                    <h1 className="text-xl font-semibold theme-text sm:text-2xl">
                      Tambah Siswa
                    </h1>

                    <p className="text-xs theme-text-secondary sm:text-sm">
                      Tambahkan data siswa baru
                    </p>

                  </div>

                </div>

              </div>

              {/* =================================================
                  ERROR
              ================================================= */}

              {error && (
                <div
                  className={`mb-5 flex items-start gap-3 rounded-xl border ${themeWarningBorder} ${themeWarningSurface} p-4`}
                >

                  <AlertCircle
                    size={20}
                    className="mt-0.5 shrink-0 text-[var(--color-warning)]"
                  />

                  <div>

                    <p className="text-sm font-semibold theme-text">
                      Gagal menyimpan
                    </p>

                    <p className="mt-1 text-sm theme-text-secondary">
                      {error}
                    </p>

                  </div>

                </div>
              )}

              {/* =================================================
                  SUCCESS
              ================================================= */}

              {success && (
                <div
                  className={`mb-5 flex items-start gap-3 rounded-xl border ${themeSuccessBorder} ${themeSuccessSurface} p-4`}
                >

                  <CheckCircle2
                    size={20}
                    className="mt-0.5 shrink-0 text-[var(--color-success)]"
                  />

                  <div>

                    <p className="text-sm font-semibold theme-text">
                      Berhasil
                    </p>

                    <p className="mt-1 text-sm theme-text-secondary">
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

                <section
                  className={`overflow-hidden rounded-2xl border ${themeNeutralBorder} theme-card ${themeCardShadow}`}
                >

                  <div
                    className={`border-b ${themeDivider} ${themeNeutralSurface} px-5 py-4`}
                  >

                    <div className="flex items-center gap-3">

                      <div
                        className={`flex h-9 w-9 items-center justify-center rounded-lg ${themePrimarySurface} text-[var(--color-primary)]`}
                      >
                        <User
                          size={18}
                        />
                      </div>

                      <div>

                        <h2 className="font-semibold theme-text">
                          Data Utama
                        </h2>

                        <p className="text-xs theme-text-muted">
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

                      <label className="mb-1.5 block text-sm font-medium theme-text-secondary">

                        ID Kelas

                        <span className="ml-1 theme-danger">
                          *
                        </span>

                      </label>

                      <div className="relative">

                        <Users
                          size={17}
                          className="absolute left-3.5 top-1/2 -translate-y-1/2 theme-text-muted"
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
                          className={`w-full rounded-xl theme-input py-2.5 pl-10 pr-4 text-sm theme-text outline-none transition placeholder:text-[var(--color-text-placeholder)] ${themeFocus}`}
                          required
                        />

                      </div>

                      <p className="mt-1.5 text-xs theme-text-muted">
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

                <section
                  className={`overflow-hidden rounded-2xl border ${themeNeutralBorder} theme-card ${themeCardShadow}`}
                >

                  <div
                    className={`border-b ${themeDivider} ${themeNeutralSurface} px-5 py-4`}
                  >

                    <div className="flex items-center gap-3">

                      <div
                        className={`flex h-9 w-9 items-center justify-center rounded-lg ${themeInfoSurface} text-[var(--color-info)]`}
                      >
                        <Users
                          size={18}
                        />
                      </div>

                      <div>

                        <h2 className="font-semibold theme-text">
                          Data Ayah
                        </h2>

                        <p className="text-xs theme-text-muted">
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

                <section
                  className={`overflow-hidden rounded-2xl border ${themeNeutralBorder} theme-card ${themeCardShadow}`}
                >

                  <div
                    className={`border-b ${themeDivider} ${themeNeutralSurface} px-5 py-4`}
                  >

                    <div className="flex items-center gap-3">

                      <div
                        className={`flex h-9 w-9 items-center justify-center rounded-lg ${themeInfoSurface} text-[var(--color-info)]`}
                      >
                        <Users
                          size={18}
                        />
                      </div>

                      <div>

                        <h2 className="font-semibold theme-text">
                          Data Ibu
                        </h2>

                        <p className="text-xs theme-text-muted">
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

                <section
                  className={`overflow-hidden rounded-2xl border ${themeNeutralBorder} theme-card ${themeCardShadow}`}
                >

                  <div
                    className={`border-b ${themeDivider} ${themeNeutralSurface} px-5 py-4`}
                  >

                    <div className="flex items-center gap-3">

                      <div
                        className={`flex h-9 w-9 items-center justify-center rounded-lg ${themeSuccessSurface} text-[var(--color-success)]`}
                      >
                        <MapPin
                          size={18}
                        />
                      </div>

                      <div>

                        <h2 className="font-semibold theme-text">
                          Alamat
                        </h2>

                        <p className="text-xs theme-text-muted">
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

                <div
                  className={`flex items-start gap-3 rounded-xl border ${themeInfoBorder} ${themeInfoSurface} p-4`}
                >

                  <AlertCircle
                    size={19}
                    className="mt-0.5 shrink-0 text-[var(--color-info)]"
                  />

                  <div>

                    <p className="text-sm font-semibold theme-text">
                      Password akun siswa
                    </p>

                    <p className="mt-1 text-xs leading-relaxed theme-text-secondary">
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
                    className={`rounded-xl border ${themeNeutralBorder} theme-card px-5 py-2.5 text-sm font-medium theme-text-secondary transition ${themeNeutralHover} disabled:cursor-not-allowed disabled:opacity-50`}
                  >
                    Batal
                  </button>

                  <button
                    type="submit"
                    disabled={loading}
                    className={`flex items-center justify-center gap-2 rounded-xl ${themePrimaryGradient} px-6 py-2.5 text-sm font-medium text-[var(--color-card)] ${themeSmallShadow} transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60`}
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

/* =========================================================
   INPUT FIELD
========================================================= */

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

      <label className="mb-1.5 block text-sm font-medium theme-text-secondary">

        {label}

        {required && (
          <span className="ml-1 theme-danger">
            *
          </span>
        )}

      </label>

      <div className="relative">

        {icon && (
          <div className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 theme-text-muted">
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
          className={`w-full rounded-xl theme-input py-2.5 ${
            icon
              ? "pl-10"
              : "pl-4"
          } pr-4 text-sm theme-text outline-none transition placeholder:text-[var(--color-text-placeholder)] ${themeFocus}`}
        />

      </div>

    </div>
  );
}

/* =========================================================
   TEXTAREA FIELD
========================================================= */

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

      <label className="mb-1.5 block text-sm font-medium theme-text-secondary">

        {label}

        {required && (
          <span className="ml-1 theme-danger">
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
        className={`w-full resize-none rounded-xl theme-input px-4 py-3 text-sm theme-text outline-none transition placeholder:text-[var(--color-text-placeholder)] ${themeFocus}`}
      />

    </div>
  );
}