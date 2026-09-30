"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

import {
  ArrowLeft,
  Save,
  UserPlus,
  User,
  Lock,
  ShieldCheck,
  Building2,
  GraduationCap,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  X,
  Info,
  Sparkles,
} from "lucide-react";

import { createUser } from "../../../../../services/user.service";

// ============================================================
// THEME HELPERS
// ============================================================

const themePrimaryGradient =
  "bg-[linear-gradient(135deg,var(--color-primary),color-mix(in_srgb,var(--color-primary)_72%,var(--color-info)))]";

const themePrimarySoft =
  "bg-[color-mix(in_srgb,var(--color-primary)_9%,transparent)]";

const themePrimarySoftBorder =
  "border-[color-mix(in_srgb,var(--color-primary)_22%,transparent)]";

const themePrimaryText = "text-[var(--color-primary)]";

const themePrimaryShadow =
  "shadow-[0_8px_20px_color-mix(in_srgb,var(--color-primary)_18%,transparent)]";

const themeCardShadow =
  "shadow-[0_4px_18px_color-mix(in_srgb,var(--color-text)_5%,transparent)]";

const themeNeutralSurface =
  "bg-[color-mix(in_srgb,var(--color-text)_4%,transparent)]";

const themeNeutralHover =
  "hover:bg-[color-mix(in_srgb,var(--color-text)_7%,transparent)]";

const themeNeutralBorder =
  "border-[color-mix(in_srgb,var(--color-text)_10%,transparent)]";

const themeDivider =
  "border-[color-mix(in_srgb,var(--color-text)_8%,transparent)]";

const themeInfoSurface =
  "bg-[color-mix(in_srgb,var(--color-info)_8%,transparent)]";

const themeInfoBorder =
  "border-[color-mix(in_srgb,var(--color-info)_22%,transparent)]";

const themeSuccessSurface =
  "bg-[color-mix(in_srgb,var(--color-success)_9%,transparent)]";

const themeSuccessBorder =
  "border-[color-mix(in_srgb,var(--color-success)_24%,transparent)]";

const themeWarningSurface =
  "bg-[color-mix(in_srgb,var(--color-warning)_9%,transparent)]";

const themeWarningBorder =
  "border-[color-mix(in_srgb,var(--color-warning)_24%,transparent)]";

const themeDangerSurface =
  "bg-[color-mix(in_srgb,var(--color-text)_5%,transparent)]";

const themeDangerBorder =
  "border-[color-mix(in_srgb,var(--color-text)_18%,transparent)]";

const themeFocus =
  "focus:border-[var(--color-primary)] focus:bg-[var(--color-card)] focus:ring-4 focus:ring-[color-mix(in_srgb,var(--color-primary)_12%,transparent)]";


// ============================================================
// PAGE
// ============================================================

export default function TambahUserPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [form, setForm] = useState({
    namaLengkap: "",
    namaPengguna: "",
    email: "",
    kataSandi: "",
    konfirmasiKataSandi: "",
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

  // ==========================================================
  // FORM HANDLERS
  // ==========================================================

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (error) setError("");
    if (success) setSuccess("");
  };

  const validateForm = () => {
    if (!form.namaLengkap.trim()) {
      return "Nama lengkap wajib diisi.";
    }

    if (!form.email.trim()) {
      return "Email wajib diisi.";
    }

    if (!isValidEmail(form.email)) {
      return "Format email tidak valid.";
    }

    if (!form.kataSandi) {
      return "Kata sandi wajib diisi.";
    }

    if (form.kataSandi.length < 6) {
      return "Kata sandi minimal 6 karakter.";
    }

    if (form.kataSandi !== form.konfirmasiKataSandi) {
      return "Konfirmasi kata sandi tidak sama.";
    }

    return "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    const validationError = validateForm();

    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setLoading(true);

      const payload = {
        namaLengkap: form.namaLengkap.trim(),
        namaPengguna: form.namaPengguna.trim() || undefined,
        email: form.email.trim().toLowerCase(),
        kataSandi: form.kataSandi,
        peranId: form.peranId || null,
        sekolahId: form.sekolahId.trim() || null,
        yayasanId: form.yayasanId.trim() || null,
        jenisKelamin: form.jenisKelamin || null,
        nip: form.nip.trim() || null,
        nipd: form.nipd.trim() || null,
        nisn: form.nisn.trim() || null,
        jabatan: form.jabatan.trim() || null,
        golongan: form.golongan.trim() || null,
        status: form.status,
      };

      const response = await createUser(payload);

      if (!response?.success) {
        throw new Error(
          response?.message || "Gagal membuat pengguna."
        );
      }

      setSuccess(
        response?.message || "Pengguna berhasil ditambahkan."
      );

      setTimeout(() => {
        router.push("/super-admin/kelola-user");
      }, 1000);
    } catch (err) {
      console.error("Gagal membuat user:", err);

      setError(
        err?.message || "Gagal menambahkan pengguna."
      );
    } finally {
      setLoading(false);
    }
  };

  // ==========================================================
  // RENDER
  // ==========================================================

  return (
    <div className="theme-page theme-text min-h-full">
      <div className="mx-auto w-full max-w-[1400px] px-4 py-5 sm:px-6 sm:py-6 lg:px-8 lg:py-8">

        {/* ================================================== */}
        {/* HERO */}
        {/* ================================================== */}

        <section
          className={`relative mb-6 overflow-hidden rounded-3xl ${themePrimaryGradient} p-6 ${themePrimaryShadow} md:p-8`}
        >
          {/* Decorative background */}
          <div
            className="absolute -right-20 -top-28 h-72 w-72 rounded-full blur-2xl"
            style={{
              background:
                "color-mix(in_srgb,var(--color-card)_12%,transparent)",
            }}
          />

          <div
            className="absolute -bottom-32 left-1/3 h-80 w-80 rounded-full blur-3xl"
            style={{
              background:
                "color-mix(in_srgb,var(--color-info)_20%,transparent)",
            }}
          />

          <div
            className="absolute inset-0 opacity-[0.07]"
            style={{
              backgroundImage:
                "linear-gradient(color-mix(in_srgb,var(--color-card)_80%,transparent) 1px, transparent 1px), linear-gradient(90deg, color-mix(in_srgb,var(--color-card)_80%,transparent) 1px, transparent 1px)",
              backgroundSize: "32px 32px",
            }}
          />

          <div className="relative flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-4">
              <Link
                href="/super-admin/kelola-user"
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[color-mix(in_srgb,var(--color-card)_20%,transparent)] bg-[color-mix(in_srgb,var(--color-card)_10%,transparent)] text-[var(--color-card)] backdrop-blur-sm transition hover:bg-[color-mix(in_srgb,var(--color-card)_20%,transparent)]"
              >
                <ArrowLeft className="h-5 w-5" />
              </Link>

              <div>
                <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-[color-mix(in_srgb,var(--color-card)_15%,transparent)] bg-[color-mix(in_srgb,var(--color-card)_10%,transparent)] px-3 py-1.5 text-xs font-semibold text-[color-mix(in_srgb,var(--color-card)_92%,transparent)] backdrop-blur-sm">
                  <UserPlus className="h-3.5 w-3.5" />
                  MANAJEMEN PENGGUNA
                </div>

                <h1 className="text-2xl font-bold tracking-tight text-[var(--color-card)] md:text-3xl">
                  Tambah User Baru
                </h1>

                <p className="mt-2 max-w-2xl text-sm leading-6 text-[color-mix(in_srgb,var(--color-card)_78%,transparent)]">
                  Lengkapi informasi di bawah untuk membuat akun
                  pengguna baru di sistem SmartSchool.
                </p>
              </div>
            </div>

            <Link
              href="/super-admin/kelola-user"
              className="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-xl border border-[color-mix(in_srgb,var(--color-card)_20%,transparent)] bg-[color-mix(in_srgb,var(--color-card)_10%,transparent)] px-5 text-sm font-semibold text-[var(--color-card)] backdrop-blur-md transition hover:bg-[color-mix(in_srgb,var(--color-card)_20%,transparent)]"
            >
              <ArrowLeft className="h-4 w-4" />
              Kembali
            </Link>
          </div>
        </section>

        {/* ================================================== */}
        {/* ERROR */}
        {/* ================================================== */}

        {error && (
          <div
            className={`mb-6 flex items-start gap-3 rounded-2xl border ${themeDangerBorder} ${themeDangerSurface} p-4`}
          >
            <div
              className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${themeNeutralSurface}`}
            >
              <AlertCircle
                className={`h-5 w-5 ${themePrimaryText}`}
              />
            </div>

            <div className="min-w-0 flex-1">
              <p className="font-semibold theme-text">
                Gagal menyimpan data
              </p>

              <p className="mt-1 text-sm leading-5 theme-text-secondary">
                {error}
              </p>
            </div>

            <button
              type="button"
              onClick={() => setError("")}
              className={`shrink-0 rounded-lg p-1.5 theme-text-muted transition ${themeNeutralHover} hover:text-[var(--color-primary)]`}
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* ================================================== */}
        {/* SUCCESS */}
        {/* ================================================== */}

        {success && (
          <div
            className={`mb-6 flex items-start gap-3 rounded-2xl border ${themeSuccessBorder} ${themeSuccessSurface} p-4`}
          >
            <div
              className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${themeSuccessSurface}`}
            >
              <CheckCircle2 className="h-5 w-5 text-[var(--color-success)]" />
            </div>

            <div className="min-w-0 flex-1">
              <p className="font-semibold text-[var(--color-success)]">
                Berhasil
              </p>

              <p className="mt-1 text-sm leading-5 theme-text-secondary">
                {success}
              </p>
            </div>
          </div>
        )}

        {/* ================================================== */}
        {/* FORM */}
        {/* ================================================== */}

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1fr_360px]">

            {/* ================================================= */}
            {/* LEFT */}
            {/* ================================================= */}

            <div className="space-y-6">

              {/* =============================================== */}
              {/* INFORMASI DASAR */}
              {/* =============================================== */}

              <section
                className={`overflow-hidden rounded-2xl border theme-border theme-card ${themeCardShadow}`}
              >
                <SectionHeader
                  icon={User}
                  title="Informasi Dasar"
                  description="Informasi utama pengguna."
                  tone="primary"
                />

                <div
                  className={`${themePrimarySoft} grid grid-cols-1 gap-5 p-5 sm:grid-cols-2 lg:p-6`}
                >
                  <InputField
                    label="Nama Lengkap"
                    name="namaLengkap"
                    value={form.namaLengkap}
                    onChange={handleChange}
                    placeholder="Contoh: Budi Santoso"
                    required
                  />

                  <InputField
                    label="Username"
                    name="namaPengguna"
                    value={form.namaPengguna}
                    onChange={handleChange}
                    placeholder="Contoh: budi.santoso"
                    helper="Opsional"
                  />

                  <InputField
                    label="Email"
                    name="email"
                    type="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="Contoh: budi@smartschool.com"
                    required
                  />

                  <SelectField
                    label="Jenis Kelamin"
                    name="jenisKelamin"
                    value={form.jenisKelamin}
                    onChange={handleChange}
                    options={[
                      {
                        value: "",
                        label: "Pilih jenis kelamin",
                      },
                      {
                        value: "L",
                        label: "Laki-laki",
                      },
                      {
                        value: "P",
                        label: "Perempuan",
                      },
                    ]}
                  />
                </div>
              </section>

              {/* =============================================== */}
              {/* AKSES AKUN */}
              {/* =============================================== */}

              <section
                className={`overflow-hidden rounded-2xl border theme-border theme-card ${themeCardShadow}`}
              >
                <SectionHeader
                  icon={ShieldCheck}
                  title="Akses Akun"
                  description="Role, kata sandi, dan status akun."
                  tone="info"
                />

                <div
                  className={`${themeInfoSurface} grid grid-cols-1 gap-5 p-5 sm:grid-cols-2 lg:p-6`}
                >
                  <SelectField
                    label="Role"
                    name="peranId"
                    value={form.peranId}
                    onChange={handleChange}
                    options={[
                      {
                        value: "",
                        label: "Pilih role",
                      },
                      {
                        value: "super_admin",
                        label: "Super Admin",
                      },
                      {
                        value: "admin_sekolah",
                        label: "Admin Sekolah",
                      },
                      {
                        value: "guru",
                        label: "Guru",
                      },
                      {
                        value: "siswa",
                        label: "Siswa",
                      },
                      {
                        value: "yayasan",
                        label: "Yayasan",
                      },
                    ]}
                    helper="Jika backend pakai UUID role, isi ID role."
                  />

                  <SelectField
                    label="Status"
                    name="status"
                    value={form.status}
                    onChange={handleChange}
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

                  <PasswordField
                    label="Kata Sandi"
                    name="kataSandi"
                    value={form.kataSandi}
                    onChange={handleChange}
                    showPassword={showPassword}
                    onToggle={() =>
                      setShowPassword((prev) => !prev)
                    }
                    placeholder="Minimal 6 karakter"
                    required
                  />

                  <PasswordField
                    label="Konfirmasi Kata Sandi"
                    name="konfirmasiKataSandi"
                    value={form.konfirmasiKataSandi}
                    onChange={handleChange}
                    showPassword={showPassword}
                    onToggle={() =>
                      setShowPassword((prev) => !prev)
                    }
                    placeholder="Ulangi kata sandi"
                    required
                  />
                </div>
              </section>

              {/* =============================================== */}
              {/* ORGANISASI */}
              {/* =============================================== */}

              <section
                className={`overflow-hidden rounded-2xl border theme-border theme-card ${themeCardShadow}`}
              >
                <SectionHeader
                  icon={Building2}
                  title="Organisasi & Tenant"
                  description="Hubungkan pengguna dengan sekolah atau yayasan."
                  tone="info"
                />

                <div
                  className={`${themeNeutralSurface} grid grid-cols-1 gap-5 p-5 sm:grid-cols-2 lg:p-6`}
                >
                  <InputField
                    label="Sekolah ID"
                    name="sekolahId"
                    value={form.sekolahId}
                    onChange={handleChange}
                    placeholder="Masukkan UUID sekolah"
                    helper="Opsional."
                  />

                  <InputField
                    label="Yayasan ID"
                    name="yayasanId"
                    value={form.yayasanId}
                    onChange={handleChange}
                    placeholder="Masukkan UUID yayasan"
                    helper="Opsional."
                  />
                </div>
              </section>

              {/* =============================================== */}
              {/* AKADEMIK & KEPEGAWAIAN */}
              {/* =============================================== */}

              <section
                className={`overflow-hidden rounded-2xl border theme-border theme-card ${themeCardShadow}`}
              >
                <SectionHeader
                  icon={GraduationCap}
                  title="Data Akademik & Kepegawaian"
                  description="Data tambahan pengguna."
                  tone="success"
                />

                <div
                  className={`${themeSuccessSurface} grid grid-cols-1 gap-5 p-5 sm:grid-cols-2 lg:p-6`}
                >
                  <InputField
                    label="NIP"
                    name="nip"
                    value={form.nip}
                    onChange={handleChange}
                    placeholder="Contoh: 198501012010011001"
                    helper="Opsional"
                  />

                  <InputField
                    label="NIPD"
                    name="nipd"
                    value={form.nipd}
                    onChange={handleChange}
                    placeholder="Masukkan NIPD"
                    helper="Opsional"
                  />

                  <InputField
                    label="NISN"
                    name="nisn"
                    value={form.nisn}
                    onChange={handleChange}
                    placeholder="Contoh: 0061234567"
                    helper="Opsional"
                  />

                  <InputField
                    label="Jabatan"
                    name="jabatan"
                    value={form.jabatan}
                    onChange={handleChange}
                    placeholder="Contoh: Guru Mata Pelajaran"
                    helper="Opsional"
                  />

                  <InputField
                    label="Golongan"
                    name="golongan"
                    value={form.golongan}
                    onChange={handleChange}
                    placeholder="Contoh: III/b"
                    helper="Opsional"
                  />
                </div>
              </section>
            </div>

            {/* ================================================= */}
            {/* RIGHT SIDEBAR */}
            {/* ================================================= */}

            <aside className="xl:sticky xl:top-0 xl:self-start">
              <div className="space-y-4">

                <PreviewCard form={form} />

                <TipsCard />

                {/* ============================================= */}
                {/* SAVE CARD */}
                {/* ============================================= */}

                <div
                  className={`overflow-hidden rounded-2xl ${themePrimaryGradient} p-5 ${themePrimaryShadow}`}
                >
                  <div className="mb-4 flex items-center gap-2">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-[color-mix(in_srgb,var(--color-card)_20%,transparent)] bg-[color-mix(in_srgb,var(--color-card)_12%,transparent)] text-[var(--color-card)] backdrop-blur-sm">
                      <Save className="h-4 w-4" />
                    </div>

                    <h3 className="text-sm font-bold text-[var(--color-card)]">
                      Simpan Perubahan
                    </h3>
                  </div>

                  <p className="mb-4 text-xs leading-5 text-[color-mix(in_srgb,var(--color-card)_78%,transparent)]">
                    Pastikan seluruh data sudah benar sebelum
                    menyimpan.
                  </p>

                  <div className="space-y-2">
                    <button
                      type="submit"
                      disabled={loading}
                      className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-[var(--color-card)] px-5 text-sm font-bold text-[var(--color-primary)] shadow-sm transition hover:bg-[color-mix(in_srgb,var(--color-card)_92%,transparent)] disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {loading ? (
                        <>
                          <RefreshCw
                            size={17}
                            className="animate-spin"
                          />
                          Menyimpan...
                        </>
                      ) : (
                        <>
                          <Save size={17} />
                          Simpan User
                        </>
                      )}
                    </button>

                    <Link
                      href="/super-admin/kelola-user"
                      className="inline-flex h-11 w-full items-center justify-center rounded-xl border border-[color-mix(in_srgb,var(--color-card)_20%,transparent)] bg-[color-mix(in_srgb,var(--color-card)_10%,transparent)] px-5 text-sm font-semibold text-[var(--color-card)] backdrop-blur-sm transition hover:bg-[color-mix(in_srgb,var(--color-card)_20%,transparent)]"
                    >
                      Batal
                    </Link>
                  </div>
                </div>
              </div>
            </aside>
          </div>
        </form>
      </div>
    </div>
  );
}


// ============================================================
// SECTION HEADER
// ============================================================

function SectionHeader({
  icon: Icon,
  title,
  description,
  tone = "primary",
}) {
  const toneMap = {
    primary: {
      wrap: `${themePrimarySoft}`,
      border: themePrimarySoftBorder,
      icon: `bg-[var(--color-primary)] text-[var(--color-card)]`,
    },

    info: {
      wrap: themeInfoSurface,
      border: themeInfoBorder,
      icon: `bg-[var(--color-info)] text-[var(--color-card)]`,
    },

    success: {
      wrap: themeSuccessSurface,
      border: themeSuccessBorder,
      icon: `bg-[var(--color-success)] text-[var(--color-card)]`,
    },

    warning: {
      wrap: themeWarningSurface,
      border: themeWarningBorder,
      icon: `bg-[var(--color-warning)] text-[var(--color-card)]`,
    },

    neutral: {
      wrap: themeNeutralSurface,
      border: themeNeutralBorder,
      icon: `${themePrimarySoft} ${themePrimaryText}`,
    },
  };

  const current = toneMap[tone] || toneMap.primary;

  return (
    <div
      className={`flex items-start gap-3 border-b ${current.border} ${current.wrap} px-5 py-5 lg:px-6`}
    >
      <div
        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${current.icon} shadow-sm`}
      >
        <Icon size={19} />
      </div>

      <div>
        <h2 className="text-base font-bold theme-text">
          {title}
        </h2>

        <p className="mt-1 text-xs leading-5 theme-text-muted">
          {description}
        </p>
      </div>
    </div>
  );
}


// ============================================================
// INPUT FIELD
// ============================================================

function InputField({
  label,
  name,
  type = "text",
  value,
  onChange,
  placeholder,
  helper,
  required = false,
}) {
  return (
    <div>
      <label
        htmlFor={name}
        className="mb-2 block text-sm font-semibold theme-text-secondary"
      >
        {label}

        {required && (
          <span className="ml-1 theme-text-primary">
            *
          </span>
        )}
      </label>

      <input
        id={name}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        className={`theme-input h-11 w-full rounded-xl px-4 text-sm shadow-sm outline-none transition ${themeFocus} hover:border-[color-mix(in_srgb,var(--color-text)_18%,transparent)] placeholder:theme-text-placeholder`}
      />

      {helper && (
        <p className="mt-1.5 text-xs theme-text-muted">
          {helper}
        </p>
      )}
    </div>
  );
}


// ============================================================
// SELECT FIELD
// ============================================================

function SelectField({
  label,
  name,
  value,
  onChange,
  options,
  helper,
}) {
  return (
    <div>
      <label
        htmlFor={name}
        className="mb-2 block text-sm font-semibold theme-text-secondary"
      >
        {label}
      </label>

      <select
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        className={`theme-input h-11 w-full rounded-xl px-4 text-sm shadow-sm outline-none transition ${themeFocus} hover:border-[color-mix(in_srgb,var(--color-text)_18%,transparent)]`}
      >
        {options.map((option) => (
          <option
            key={option.value}
            value={option.value}
          >
            {option.label}
          </option>
        ))}
      </select>

      {helper && (
        <p className="mt-1.5 text-xs leading-5 theme-text-muted">
          {helper}
        </p>
      )}
    </div>
  );
}


// ============================================================
// PASSWORD FIELD
// ============================================================

function PasswordField({
  label,
  name,
  value,
  onChange,
  showPassword,
  onToggle,
  placeholder,
  required = false,
}) {
  return (
    <div>
      <label
        htmlFor={name}
        className="mb-2 block text-sm font-semibold theme-text-secondary"
      >
        {label}

        {required && (
          <span className="ml-1 theme-text-primary">
            *
          </span>
        )}
      </label>

      <div className="relative">
        <Lock
          size={17}
          className="absolute left-3.5 top-1/2 -translate-y-1/2 theme-text-muted"
        />

        <input
          id={name}
          name={name}
          type={showPassword ? "text" : "password"}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          className={`theme-input h-11 w-full rounded-xl pl-10 pr-11 text-sm shadow-sm outline-none transition ${themeFocus} placeholder:theme-text-placeholder`}
        />

        <button
          type="button"
          onClick={onToggle}
          className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1 theme-text-muted transition hover:text-[var(--color-primary)]"
        >
          {showPassword ? (
            <EyeOff size={17} />
          ) : (
            <Eye size={17} />
          )}
        </button>
      </div>
    </div>
  );
}


// ============================================================
// PREVIEW CARD
// ============================================================

function PreviewCard({ form }) {
  const name =
    form.namaLengkap?.trim() || "Pengguna Baru";

  const initial = name.charAt(0).toUpperCase();

  const role = formatRole(form.peranId);

  const status =
    form.status === "aktif"
      ? "Aktif"
      : "Nonaktif";

  const isActive =
    form.status === "aktif";

  return (
    <div
      className={`overflow-hidden rounded-2xl border theme-border theme-card ${themeCardShadow}`}
    >
      <div
        className={`flex items-center gap-2 border-b ${themePrimarySoftBorder} ${themePrimarySoft} px-5 py-4`}
      >
        <div
          className={`flex h-9 w-9 items-center justify-center rounded-lg ${themePrimaryGradient} text-[var(--color-card)] shadow-sm`}
        >
          <Sparkles className="h-4 w-4" />
        </div>

        <h3 className="text-sm font-bold theme-text">
          Preview Akun
        </h3>
      </div>

      <div className={`${themeNeutralSurface} p-5`}>
        <div className="flex items-center gap-4">
          <div
            className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl ${themePrimaryGradient} text-lg font-bold text-[var(--color-card)] ${themePrimaryShadow}`}
          >
            {initial}
          </div>

          <div className="min-w-0">
            <p className="truncate text-sm font-bold theme-text">
              {name}
            </p>

            <p className="mt-0.5 truncate text-xs theme-text-muted">
              {form.email?.trim() ||
                "email@contoh.com"}
            </p>
          </div>
        </div>

        <div
          className={`mt-4 space-y-2.5 rounded-xl border ${themeDivider} theme-card p-4`}
        >
          <PreviewRow
            label="Username"
            value={
              form.namaPengguna?.trim() || "-"
            }
          />

          <PreviewRow
            label="Role"
            value={role}
          />

          <PreviewRow
            label="Jenis Kelamin"
            value={
              form.jenisKelamin === "L"
                ? "Laki-laki"
                : form.jenisKelamin === "P"
                ? "Perempuan"
                : "-"
            }
          />

          <div className="flex items-center justify-between gap-3">
            <span className="text-xs theme-text-muted">
              Status
            </span>

            <span
              className={
                isActive
                  ? `inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border ${themeSuccessBorder} ${themeSuccessSurface} px-2.5 py-1 text-[11px] font-semibold text-[var(--color-success)]`
                  : `inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border ${themeNeutralBorder} ${themeNeutralSurface} px-2.5 py-1 text-[11px] font-semibold theme-text-secondary`
              }
            >
              {status}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}


// ============================================================
// PREVIEW ROW
// ============================================================

function PreviewRow({ label, value }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-xs theme-text-muted">
        {label}
      </span>

      <span className="max-w-[60%] truncate text-xs font-semibold theme-text">
        {value}
      </span>
    </div>
  );
}


// ============================================================
// TIPS CARD
// ============================================================

function TipsCard() {
  const items = [
    "Isi nama lengkap dan email wajib dengan benar.",
    "Gunakan kata sandi minimal 6 karakter.",
    "Pilih role sesuai hak akses pengguna.",
    "Isi data sekolah/yayasan untuk multi-tenant.",
  ];

  return (
    <div
      className={`overflow-hidden rounded-2xl border ${themeWarningBorder} ${themeWarningSurface} ${themeCardShadow}`}
    >
      <div
        className={`flex items-center gap-2 border-b ${themeWarningBorder} px-5 py-4`}
      >
        <div
          className={`flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--color-warning)] text-[var(--color-card)] shadow-sm`}
        >
          <Info className="h-4 w-4" />
        </div>

        <h3 className="text-sm font-bold text-[var(--color-warning)]">
          Panduan Cepat
        </h3>
      </div>

      <ul className="space-y-2.5 p-5">
        {items.map((item, i) => (
          <li
            key={i}
            className="flex items-start gap-2.5"
          >
            <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--color-warning)]" />

            <span className="text-xs leading-5 theme-text-secondary">
              {item}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}


// ============================================================
// HELPERS
// ============================================================

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function formatRole(role) {
  if (!role) {
    return "Belum dipilih";
  }

  const map = {
    super_admin: "Super Admin",
    admin_sekolah: "Admin Sekolah",
    guru: "Guru",
    siswa: "Siswa",
    yayasan: "Yayasan",
  };

  return map[role] || role;
}