"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

import Header from "@/app/components/Header";
import Sidebar from "@/app/components/Sidebar";

import {
  ArrowLeft,
  Save,
  User,
  UserRound,
  MapPin,
  Users,
  Loader2,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";

import {
  getUserById,
  updateUser,
} from "@/services/user.service";

/* ============================================================
   THEME HELPERS
   ============================================================ */

const themePrimarySoft =
  "bg-[color-mix(in_srgb,var(--color-primary)_9%,transparent)]";

const themePrimarySoftBorder =
  "border-[color-mix(in_srgb,var(--color-primary)_22%,transparent)]";

const themePrimaryText =
  "text-[var(--color-primary)]";

const themePrimaryShadow =
  "shadow-[0_8px_20px_color-mix(in_srgb,var(--color-primary)_16%,transparent)]";

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

const themeSuccessSurface =
  "bg-[color-mix(in_srgb,var(--color-success)_9%,transparent)]";

const themeSuccessBorder =
  "border-[color-mix(in_srgb,var(--color-success)_24%,transparent)]";

const themeDangerSurface =
  "bg-[color-mix(in_srgb,var(--color-text)_5%,transparent)]";

const themeDangerBorder =
  "border-[color-mix(in_srgb,var(--color-text)_18%,transparent)]";

const themeFocus =
  "focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[color-mix(in_srgb,var(--color-primary)_14%,transparent)]";

/* ============================================================
   DEFAULT FORM
   ============================================================ */

const DEFAULT_FORM = {
  nama: "",
  nis: "",
  nisn: "",
  kelas: "",
  status: "aktif",
  gender: "L",
  tglLahir: "",
  joinDate: "",
  tempatLahir: "",

  kecamatan: "",
  kota: "",
  kelurahan: "",
  provinsi: "",

  email: "",
  phone: "",
  alamat: "",

  nikOrtu: "",
  namaOrtu: "",
  pekerjaanOrtu: "",
  alamatKtpOrtu: "",
  alamatDomisiliOrtu: "",
  domisiliSama: true,
};

/* ============================================================
   HELPER
   ============================================================ */

function formatDateForInput(value) {
  if (!value) return "";

  try {
    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return "";
    }

    return date.toISOString().slice(0, 10);
  } catch {
    return "";
  }
}

function normalizeGender(value) {
  if (!value) return "L";

  const normalized = String(value).toLowerCase();

  if (
    normalized === "p" ||
    normalized === "perempuan" ||
    normalized === "female" ||
    normalized === "wanita"
  ) {
    return "P";
  }

  return "L";
}

function normalizeStatus(value) {
  if (!value) return "aktif";

  const normalized = String(value).toLowerCase();

  if (
    normalized === "nonaktif" ||
    normalized === "inactive" ||
    normalized === "tidak aktif"
  ) {
    return "nonaktif";
  }

  return "aktif";
}

function getErrorMessage(error) {
  if (!error) {
    return "Terjadi kesalahan.";
  }

  if (typeof error === "string") {
    return error;
  }

  return (
    error?.message ||
    error?.response?.data?.message ||
    "Terjadi kesalahan saat memproses data."
  );
}

/* ============================================================
   PAGE
   ============================================================ */

export default function EditSiswaPage() {
  const router = useRouter();
  const params = useParams();

  const id = params?.id ? String(params.id) : "";

  /* ==========================================================
     STATE
     ========================================================== */

  const [form, setForm] = useState(DEFAULT_FORM);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  /* ==========================================================
     LOAD DATA
     ========================================================== */

  useEffect(() => {
    if (!id) {
      setLoading(false);
      setError("ID siswa tidak ditemukan.");
      return;
    }

    let cancelled = false;

    const loadData = async () => {
      try {
        setLoading(true);
        setError("");
        setSuccessMessage("");

        const response = await getUserById(id);

        if (cancelled) return;

        const user = response?.data;

        if (!user) {
          throw new Error("Data siswa tidak ditemukan.");
        }

        setForm({
          nama: user.namaLengkap || "",

          nis: user.nipd || "",

          nisn: user.nisn || "",

          kelas:
            user.kelas?.nama ||
            user.kelasNama ||
            user.kelas?.namaKelas ||
            "",

          status: normalizeStatus(user.status),

          gender: normalizeGender(user.jenisKelamin),

          tglLahir: formatDateForInput(
            user.tanggalLahir
          ),

          joinDate: formatDateForInput(
            user.dibuatPada
          ),

          tempatLahir: user.tempatLahir || "",

          kecamatan: user.kecamatan || "",

          kota:
            user.kotaKabupaten ||
            user.kota ||
            "",

          kelurahan: user.kelurahan || "",

          provinsi: user.provinsi || "",

          email: user.email || "",

          phone: user.noTelepon || "",

          alamat: user.alamat || "",

          nikOrtu: user.nik || "",

          namaOrtu:
            user.namaAyah ||
            user.namaIbu ||
            "",

          pekerjaanOrtu:
            user.pekerjaanAyah ||
            user.pekerjaanIbu ||
            "",

          alamatKtpOrtu:
            user.alamatKtp || "",

          alamatDomisiliOrtu:
            user.alamatDomisili || "",

          domisiliSama:
            !user.alamatDomisili ||
            user.alamatDomisili === user.alamatKtp,
        });
      } catch (err) {
        if (cancelled) return;

        console.error("Error load siswa:", err);

        setError(getErrorMessage(err));
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadData();

    return () => {
      cancelled = true;
    };
  }, [id]);

  /* ==========================================================
     HANDLE INPUT
     ========================================================== */

  const handleChange = (event) => {
    const { name, value, type, checked } =
      event.target;

    setForm((prev) => ({
      ...prev,
      [name]:
        type === "checkbox"
          ? checked
          : value,
    }));

    if (error) {
      setError("");
    }

    if (successMessage) {
      setSuccessMessage("");
    }
  };

  /* ==========================================================
     HANDLE DOMISILI
     ========================================================== */

  const handleDomisiliSamaChange = (event) => {
    const checked = event.target.checked;

    setForm((prev) => ({
      ...prev,
      domisiliSama: checked,
      alamatDomisiliOrtu: checked
        ? prev.alamatKtpOrtu
        : prev.alamatDomisiliOrtu,
    }));
  };

  /* ==========================================================
     VALIDATION
     ========================================================== */

  const validateForm = () => {
    if (!form.nama.trim()) {
      return "Nama siswa wajib diisi.";
    }

    if (!form.nis.trim()) {
      return "NIS wajib diisi.";
    }

    if (!form.nisn.trim()) {
      return "NISN wajib diisi.";
    }

    if (!form.email.trim()) {
      return "Email wajib diisi.";
    }

    return "";
  };

  /* ==========================================================
     SUBMIT
     ========================================================== */

  const handleSubmit = async (event) => {
    event.preventDefault();

    const validationError = validateForm();

    if (validationError) {
      setError(validationError);

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });

      return;
    }

    if (!id) {
      setError("ID siswa tidak ditemukan.");
      return;
    }

    try {
      setSaving(true);
      setError("");
      setSuccessMessage("");

      const payload = {
        namaLengkap: form.nama.trim(),

        nipd: form.nis.trim(),

        nisn: form.nisn.trim(),

        email: form.email.trim(),

        jenisKelamin: form.gender,

        tempatLahir:
          form.tempatLahir.trim() || null,

        tanggalLahir:
          form.tglLahir || null,

        alamat:
          form.alamat.trim() || null,

        noTelepon:
          form.phone.trim() || null,

        status: form.status,

        nik:
          form.nikOrtu.trim() || null,

        namaAyah:
          form.namaOrtu.trim() || null,

        pekerjaanAyah:
          form.pekerjaanOrtu.trim() || null,

        alamatKtp:
          form.alamatKtpOrtu.trim() || null,

        alamatDomisili: form.domisiliSama
          ? form.alamatKtpOrtu.trim() || null
          : form.alamatDomisiliOrtu.trim() ||
            null,

        kecamatan:
          form.kecamatan.trim() || null,

        kelurahan:
          form.kelurahan.trim() || null,

        kota:
          form.kota.trim() || null,
      };

      console.log(
        "========== UPDATE SISWA =========="
      );
      console.log("ID:", id);
      console.log("PAYLOAD:", payload);
      console.log(
        "=================================="
      );

      const response = await updateUser(
        id,
        payload
      );

      console.log(
        "========== RESPONSE UPDATE =========="
      );
      console.log(response);
      console.log(
        "====================================="
      );

      setSuccessMessage(
        response?.message ||
          "Data siswa berhasil diperbarui."
      );

      setTimeout(() => {
        router.push("/admin/siswa");
      }, 700);
    } catch (err) {
      console.error(
        "Error update siswa:",
        err
      );

      setError(getErrorMessage(err));

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    } finally {
      setSaving(false);
    }
  };

  /* ==========================================================
     LOADING
     ========================================================== */

  if (loading) {
    return (
      <div className="theme-page flex h-screen overflow-hidden">
        <Sidebar
          role="admin"
          active="siswa"
        />

        <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
          <Header />

          <main className="flex flex-1 items-center justify-center overflow-y-auto p-6">
            <div className="flex flex-col items-center gap-3">
              <div
                className={`flex h-12 w-12 items-center justify-center rounded-full ${themePrimarySoft} ${themePrimaryText}`}
              >
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>

              <p className="theme-text-secondary text-sm font-medium">
                Mengambil data siswa...
              </p>
            </div>
          </main>
        </div>
      </div>
    );
  }

  /* ==========================================================
     UI
     ========================================================== */

  return (
    <div className="theme-page flex h-screen overflow-hidden">
      <Sidebar
        role="admin"
        active="siswa"
      />

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <Header />

        <main className="flex-1 overflow-y-auto">
          <div className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 lg:px-8">

            {/* ==================================================
                PAGE HEADER
                ================================================== */}

            <div className="mb-6">
              <button
                type="button"
                onClick={() =>
                  router.push("/admin/siswa")
                }
                className="theme-text-muted mb-4 inline-flex items-center gap-2 text-sm font-medium transition hover:text-[var(--color-primary)]"
              >
                <ArrowLeft className="h-4 w-4" />

                Kembali ke Data Siswa
              </button>

              <div>
                <h1 className="theme-text text-2xl font-bold tracking-tight">
                  Edit Data Siswa
                </h1>

                <p className="theme-text-muted mt-1 text-sm">
                  Perbarui informasi data siswa melalui
                  sistem.
                </p>
              </div>
            </div>

            {/* ==================================================
                ERROR MESSAGE
                ================================================== */}

            {error && (
              <div
                className={`theme-danger ${themeDangerSurface} ${themeDangerBorder} mb-5 flex items-start gap-3 rounded-xl border px-4 py-3`}
              >
                <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />

                <div>
                  <p className="text-sm font-semibold">
                    Gagal
                  </p>

                  <p className="mt-0.5 text-sm opacity-90">
                    {error}
                  </p>
                </div>
              </div>
            )}

            {/* ==================================================
                SUCCESS MESSAGE
                ================================================== */}

            {successMessage && (
              <div
                className={`theme-success ${themeSuccessSurface} ${themeSuccessBorder} mb-5 flex items-start gap-3 rounded-xl border px-4 py-3`}
              >
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" />

                <div>
                  <p className="text-sm font-semibold">
                    Berhasil
                  </p>

                  <p className="mt-0.5 text-sm opacity-90">
                    {successMessage}
                  </p>
                </div>
              </div>
            )}

            {/* ==================================================
                FORM
                ================================================== */}

            <form onSubmit={handleSubmit}>

              {/* ==================================================
                  DATA UTAMA
                  ================================================== */}

              <FormSection
                icon={<User className="h-5 w-5" />}
                title="Data Utama Siswa"
                description="Informasi dasar siswa."
              >
                <div className="grid gap-5 p-6 md:grid-cols-2">

                  <FormField
                    label="Nama Lengkap"
                    required
                    className="md:col-span-2"
                  >
                    <ThemeInput
                      type="text"
                      name="nama"
                      value={form.nama}
                      onChange={handleChange}
                      placeholder="Masukkan nama lengkap siswa"
                    />
                  </FormField>

                  <FormField
                    label="NIS"
                    required
                  >
                    <ThemeInput
                      type="text"
                      name="nis"
                      value={form.nis}
                      onChange={handleChange}
                      placeholder="Masukkan NIS"
                    />
                  </FormField>

                  <FormField
                    label="NISN"
                    required
                  >
                    <ThemeInput
                      type="text"
                      name="nisn"
                      value={form.nisn}
                      onChange={handleChange}
                      placeholder="Masukkan NISN"
                    />
                  </FormField>

                  <FormField label="Kelas">
                    <ThemeInput
                      type="text"
                      name="kelas"
                      value={form.kelas}
                      readOnly
                      disabled
                      placeholder="Kelas belum tersedia dari backend"
                    />

                    <FieldHint>
                      Data kelas belum dapat diubah melalui
                      endpoint pengguna saat ini.
                    </FieldHint>
                  </FormField>

                  <FormField label="Status">
                    <ThemeSelect
                      name="status"
                      value={form.status}
                      onChange={handleChange}
                    >
                      <option value="aktif">
                        Aktif
                      </option>

                      <option value="nonaktif">
                        Nonaktif
                      </option>
                    </ThemeSelect>
                  </FormField>

                  <FormField label="Jenis Kelamin">
                    <ThemeSelect
                      name="gender"
                      value={form.gender}
                      onChange={handleChange}
                    >
                      <option value="L">
                        Laki-laki
                      </option>

                      <option value="P">
                        Perempuan
                      </option>
                    </ThemeSelect>
                  </FormField>

                  <FormField label="Tempat Lahir">
                    <ThemeInput
                      type="text"
                      name="tempatLahir"
                      value={form.tempatLahir}
                      onChange={handleChange}
                      placeholder="Masukkan tempat lahir"
                    />
                  </FormField>

                  <FormField label="Tanggal Lahir">
                    <ThemeInput
                      type="date"
                      name="tglLahir"
                      value={form.tglLahir}
                      onChange={handleChange}
                    />
                  </FormField>

                  <FormField label="Tanggal Bergabung">
                    <ThemeInput
                      type="date"
                      name="joinDate"
                      value={form.joinDate}
                      readOnly
                      disabled
                    />

                    <FieldHint>
                      Diambil dari tanggal data dibuat di
                      backend.
                    </FieldHint>
                  </FormField>
                </div>
              </FormSection>

              {/* ==================================================
                  ALAMAT
                  ================================================== */}

              <FormSection
                icon={<MapPin className="h-5 w-5" />}
                title="Alamat Siswa"
                description="Informasi alamat tempat tinggal siswa."
              >
                <div className="grid gap-5 p-6 md:grid-cols-2">

                  <FormField
                    label="Alamat Lengkap"
                    className="md:col-span-2"
                  >
                    <ThemeTextarea
                      name="alamat"
                      value={form.alamat}
                      onChange={handleChange}
                      rows={3}
                      placeholder="Masukkan alamat lengkap siswa"
                    />
                  </FormField>

                  <FormField label="Provinsi">
                    <ThemeInput
                      type="text"
                      name="provinsi"
                      value={form.provinsi}
                      onChange={handleChange}
                      placeholder="Masukkan provinsi"
                    />

                    <FieldHint>
                      Field ini belum dikirim ke backend karena
                      belum ada pada controller.
                    </FieldHint>
                  </FormField>

                  <FormField label="Kota / Kabupaten">
                    <ThemeInput
                      type="text"
                      name="kota"
                      value={form.kota}
                      onChange={handleChange}
                      placeholder="Masukkan kota/kabupaten"
                    />
                  </FormField>

                  <FormField label="Kecamatan">
                    <ThemeInput
                      type="text"
                      name="kecamatan"
                      value={form.kecamatan}
                      onChange={handleChange}
                      placeholder="Masukkan kecamatan"
                    />
                  </FormField>

                  <FormField label="Kelurahan">
                    <ThemeInput
                      type="text"
                      name="kelurahan"
                      value={form.kelurahan}
                      onChange={handleChange}
                      placeholder="Masukkan kelurahan"
                    />
                  </FormField>
                </div>
              </FormSection>

              {/* ==================================================
                  KONTAK
                  ================================================== */}

              <FormSection
                icon={<UserRound className="h-5 w-5" />}
                title="Informasi Kontak"
                description="Email dan nomor telepon siswa."
              >
                <div className="grid gap-5 p-6 md:grid-cols-2">

                  <FormField
                    label="Email"
                    required
                  >
                    <ThemeInput
                      type="email"
                      name="email"
                      value={form.email}
                      onChange={handleChange}
                      placeholder="contoh@email.com"
                    />
                  </FormField>

                  <FormField label="Nomor Telepon">
                    <ThemeInput
                      type="tel"
                      name="phone"
                      value={form.phone}
                      onChange={handleChange}
                      placeholder="08xxxxxxxxxx"
                    />
                  </FormField>
                </div>
              </FormSection>

              {/* ==================================================
                  ORANG TUA / WALI
                  ================================================== */}

              <FormSection
                icon={<Users className="h-5 w-5" />}
                title="Data Orang Tua / Wali"
                description="Informasi orang tua atau wali siswa."
              >
                <div className="grid gap-5 p-6 md:grid-cols-2">

                  <FormField label="NIK Orang Tua / Wali">
                    <ThemeInput
                      type="text"
                      name="nikOrtu"
                      value={form.nikOrtu}
                      onChange={handleChange}
                      placeholder="Masukkan NIK"
                    />
                  </FormField>

                  <FormField label="Nama Orang Tua / Wali">
                    <ThemeInput
                      type="text"
                      name="namaOrtu"
                      value={form.namaOrtu}
                      onChange={handleChange}
                      placeholder="Masukkan nama orang tua / wali"
                    />
                  </FormField>

                  <FormField
                    label="Pekerjaan Orang Tua / Wali"
                    className="md:col-span-2"
                  >
                    <ThemeInput
                      type="text"
                      name="pekerjaanOrtu"
                      value={form.pekerjaanOrtu}
                      onChange={handleChange}
                      placeholder="Masukkan pekerjaan"
                    />
                  </FormField>

                  <FormField
                    label="Alamat KTP Orang Tua / Wali"
                    className="md:col-span-2"
                  >
                    <ThemeTextarea
                      name="alamatKtpOrtu"
                      value={form.alamatKtpOrtu}
                      onChange={handleChange}
                      rows={3}
                      placeholder="Masukkan alamat sesuai KTP"
                    />
                  </FormField>

                  {/* DOMISILI CHECKBOX */}
                  <div className="md:col-span-2">
                    <label className="theme-text-secondary flex cursor-pointer items-center gap-3 text-sm font-medium">
                      <input
                        type="checkbox"
                        checked={form.domisiliSama}
                        onChange={
                          handleDomisiliSamaChange
                        }
                        className={`h-4 w-4 rounded ${themePrimaryText} ${themePrimarySoftBorder} focus:ring-[var(--color-primary)]`}
                      />

                      <span>
                        Alamat domisili sama dengan alamat KTP
                      </span>
                    </label>
                  </div>

                  {!form.domisiliSama && (
                    <FormField
                      label="Alamat Domisili Orang Tua / Wali"
                      className="md:col-span-2"
                    >
                      <ThemeTextarea
                        name="alamatDomisiliOrtu"
                        value={form.alamatDomisiliOrtu}
                        onChange={handleChange}
                        rows={3}
                        placeholder="Masukkan alamat domisili"
                      />
                    </FormField>
                  )}
                </div>
              </FormSection>

              {/* ==================================================
                  ACTION
                  ================================================== */}

              <div
                className={`flex flex-col-reverse gap-3 border-t ${themeDivider} pt-6 sm:flex-row sm:justify-end`}
              >
                <button
                  type="button"
                  onClick={() =>
                    router.push("/admin/siswa")
                  }
                  disabled={saving}
                  className={`theme-card theme-text-secondary ${themeNeutralBorder} ${themeSmallShadow} inline-flex items-center justify-center rounded-xl border px-5 py-3 text-sm font-semibold transition ${themeNeutralHover} disabled:cursor-not-allowed disabled:opacity-60`}
                >
                  Batal
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className={`theme-primary ${themePrimaryShadow} inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold text-[var(--color-card)] transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60`}
                >
                  {saving ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Menyimpan...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4" />
                      Perbarui Data
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

/* ============================================================
   FORM SECTION
   ============================================================ */

function FormSection({
  icon,
  title,
  description,
  children,
}) {
  return (
    <section
      className={`theme-card mb-6 overflow-hidden rounded-2xl border ${themeNeutralBorder} ${themeCardShadow}`}
    >
      <div
        className={`border-b ${themeDivider} px-6 py-5`}
      >
        <div className="flex items-center gap-3">
          <div
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border ${themePrimarySoftBorder} ${themePrimarySoft} ${themePrimaryText}`}
          >
            {icon}
          </div>

          <div className="min-w-0">
            <h2 className="theme-text text-base font-semibold">
              {title}
            </h2>

            <p className="theme-text-muted mt-0.5 text-sm">
              {description}
            </p>
          </div>
        </div>
      </div>

      {children}
    </section>
  );
}

/* ============================================================
   FORM FIELD
   ============================================================ */

function FormField({
  label,
  required = false,
  children,
  className = "",
}) {
  return (
    <div className={className}>
      <label className="theme-text-secondary mb-2 block text-sm font-medium">
        {label}

        {required && (
          <span className="theme-danger ml-1">
            *
          </span>
        )}
      </label>

      {children}
    </div>
  );
}

/* ============================================================
   INPUT
   ============================================================ */

function ThemeInput({
  disabled = false,
  ...props
}) {
  return (
    <input
      {...props}
      disabled={disabled}
      className={`theme-input w-full rounded-xl border px-4 py-3 text-sm outline-none transition ${themeFocus} ${
        disabled
          ? "cursor-not-allowed opacity-70"
          : ""
      }`}
    />
  );
}

/* ============================================================
   SELECT
   ============================================================ */

function ThemeSelect(props) {
  return (
    <select
      {...props}
      className={`theme-input w-full rounded-xl border px-4 py-3 text-sm outline-none transition ${themeFocus}`}
    />
  );
}

/* ============================================================
   TEXTAREA
   ============================================================ */

function ThemeTextarea({
  ...props
}) {
  return (
    <textarea
      {...props}
      className={`theme-input w-full resize-none rounded-xl border px-4 py-3 text-sm outline-none transition ${themeFocus}`}
    />
  );
}

/* ============================================================
   FIELD HINT
   ============================================================ */

function FieldHint({ children }) {
  return (
    <p className="theme-text-muted mt-1.5 text-xs leading-5">
      {children}
    </p>
  );
}