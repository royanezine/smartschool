"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

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
  X,
} from "lucide-react";

import {
  getUserById,
  updateUser,
} from "@/services/user.service";


const themePrimaryGradient =
  "bg-[linear-gradient(135deg,var(--color-primary),color-mix(in_srgb,var(--color-primary)_72%,var(--color-info)))]";

const themePrimarySoft =
  "bg-[color-mix(in_srgb,var(--color-primary)_9%,transparent)]";

const themePrimaryText = "text-[var(--color-primary)]";

const themePrimaryShadow =
  "shadow-[0_8px_20px_color-mix(in_srgb,var(--color-primary)_18%,transparent)]";

const themeCardShadow =
  "shadow-[0_4px_18px_color-mix(in_srgb,var(--color-text)_5%,transparent)]";

const themeNeutralSurface =
  "bg-[color-mix(in_srgb,var(--color-text)_4%,transparent)]";

const themeNeutralHover =
  "hover:bg-[color-mix(in_srgb,var(--color-text)_7%,transparent)]";

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
  "focus:border-[var(--color-primary)] focus:bg-[var(--color-card)] focus:ring-4 focus:ring-[color-mix(in_srgb,var(--color-primary)_12%,transparent)]";


export default function EditUserPage() {
  return (
    <Suspense
      fallback={
        <div className="theme-page flex min-h-full items-center justify-center py-24">
          <div className="text-center">
            <RefreshCw
              className={`mx-auto mb-3 h-7 w-7 animate-spin ${themePrimaryText}`}
            />
            <p className="text-sm font-medium theme-text-secondary">
              Memuat halaman edit pengguna...
            </p>
          </div>
        </div>
      }
    >
      <EditUserContent />
    </Suspense>
  );
}


function EditUserContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const userId = searchParams.get("id");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [userRoleName, setUserRoleName] = useState("");

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


  useEffect(() => {
    let cancelled = false;

    async function loadUser() {
      if (!userId) {
        setError("ID pengguna tidak ditemukan.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError("");

        const response = await getUserById(userId);

        const user =
          response?.data?.user ??
          response?.data ??
          response?.user ??
          null;

        if (!user) {
          throw new Error("Data pengguna tidak ditemukan.");
        }

        if (cancelled) return;

        const normalizedRole = String(
          user.peran?.nama || user.peran?.namaTampilan || user.role || ""
        )
          .trim()
          .toLowerCase()
          .replace(/[\s-]+/g, "_");
        setUserRoleName(normalizedRole);

        setForm({
          email: user.email || "",
          namaPengguna:
            user.namaPengguna || user.username || "",
          namaLengkap:
            user.namaLengkap || user.nama || "",
          kataSandi: "",
          peranId:
            user.peranId || user.peran?.id || "",
          sekolahId:
            user.sekolahId || user.sekolah?.id || "",
          yayasanId:
            user.yayasanId || user.yayasan?.id || "",
          jenisKelamin: user.jenisKelamin || "",
          nip: user.nip || "",
          nipd: user.nipd || "",
          nisn: user.nisn || "",
          jabatan: normalizedRole === "siswa" ? "" : user.jabatan || "",
          golongan: user.golongan || "",
          status: user.status || "aktif",
        });
      } catch (err) {
        console.error("Gagal mengambil detail user:", err);

        if (!cancelled) {
          setError(
            err?.message || "Gagal mengambil data pengguna."
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadUser();

    return () => {
      cancelled = true;
    };
  }, [userId]);


  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };


  const isSiswa =
    userRoleName === "siswa" ||
    String(form.peranId || "")
      .trim()
      .toLowerCase() === "siswa";

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
        namaPengguna: form.namaPengguna.trim() || undefined,
        namaLengkap: form.namaLengkap.trim(),
        peranId: form.peranId.trim() || null,
        sekolahId: form.sekolahId.trim() || null,
        yayasanId: form.yayasanId.trim() || null,
        jenisKelamin: form.jenisKelamin || null,
        nip: form.nip.trim() || null,
        nipd: form.nipd.trim() || null,
        nisn: form.nisn.trim() || null,
        ...(!isSiswa
          ? { jabatan: form.jabatan.trim() || null }
          : {}),
        golongan: form.golongan.trim() || null,
        status: form.status,
      };

      if (form.kataSandi.trim()) {
        payload.kataSandi = form.kataSandi.trim();
      }

      await updateUser(userId, payload);

      setSuccess("Data pengguna berhasil diperbarui.");

      setTimeout(() => {
        router.push("/super-admin/kelola-user");
      }, 800);
    } catch (err) {
      console.error("Gagal memperbarui user:", err);

      setError(
        err?.message || "Gagal memperbarui data pengguna."
      );
    } finally {
      setSaving(false);
    }
  };


  if (loading) {
    return (
      <div className="theme-page theme-text min-h-full w-full min-w-0">
        <div className="flex min-h-[60vh] w-full flex-col items-center justify-center px-4">
          <div
            className={`mb-4 flex h-12 w-12 items-center justify-center rounded-xl ${themePrimarySoft} ${themePrimaryText}`}
          >
            <RefreshCw className="h-5 w-5 animate-spin" />
          </div>

          <p className="text-sm font-semibold theme-text">
            Memuat data pengguna...
          </p>

          <p className="mt-1 text-xs theme-text-muted">
            Mengambil data dari server SmartSchool.
          </p>
        </div>
      </div>
    );
  }


  return (
    <div className="theme-page theme-text min-h-full w-full min-w-0">
      <div className="w-full min-w-0 px-4 py-5 sm:px-6 sm:py-6 lg:px-8 lg:py-8">

        <section
          className={`relative mb-6 w-full overflow-hidden rounded-3xl ${themePrimaryGradient} ${themePrimaryShadow}`}
        >
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -right-20 -top-28 h-72 w-72 rounded-full bg-[color-mix(in_srgb,var(--color-card)_12%,transparent)] blur-2xl" />
            <div className="absolute -bottom-32 left-1/3 h-80 w-80 rounded-full bg-[color-mix(in_srgb,var(--color-card)_9%,transparent)] blur-3xl" />
          </div>

          <div className="relative p-6 md:p-8">
            <button
              type="button"
              onClick={() =>
                router.push("/super-admin/kelola-user")
              }
              className="mb-4 inline-flex items-center gap-2 rounded-full border border-[color-mix(in_srgb,var(--color-card)_18%,transparent)] bg-[color-mix(in_srgb,var(--color-card)_10%,transparent)] px-3 py-1.5 text-xs font-semibold text-[var(--color-card)] backdrop-blur-sm transition hover:bg-[color-mix(in_srgb,var(--color-card)_18%,transparent)]"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Kembali ke Kelola User
            </button>

            <h1 className="text-2xl font-bold tracking-tight text-[var(--color-card)] md:text-3xl">
              Edit Pengguna
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-[color-mix(in_srgb,var(--color-card)_78%,transparent)]">
              Perbarui informasi akun pengguna SmartSchool.
            </p>
          </div>
        </section>


        {error && (
          <div
            role="alert"
            className={`mb-6 flex items-start gap-3 rounded-2xl border ${themeDangerBorder} ${themeDangerSurface} p-4`}
          >
            <AlertCircle
              className={`mt-0.5 h-5 w-5 shrink-0 ${themePrimaryText}`}
            />

            <div className="min-w-0 flex-1">
              <p className="font-semibold theme-text">
                Terjadi kesalahan
              </p>

              <p className="mt-1 text-sm theme-text-secondary">
                {error}
              </p>
            </div>

            <button
              type="button"
              onClick={() => setError("")}
              className={`shrink-0 rounded-lg p-1.5 theme-text-muted transition ${themeNeutralHover}`}
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        {success && (
          <div
            role="status"
            className={`mb-6 flex items-start gap-3 rounded-2xl border ${themeSuccessBorder} ${themeSuccessSurface} p-4`}
          >
            <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-[var(--color-success)]" />

            <div className="min-w-0">
              <p className="font-semibold text-[var(--color-success)]">
                Berhasil
              </p>

              <p className="mt-1 text-sm theme-text-secondary">
                {success}
              </p>
            </div>
          </div>
        )}


        <form onSubmit={handleSubmit} className="w-full space-y-6">
          <section
            className={`overflow-hidden rounded-2xl border theme-border theme-card ${themeCardShadow}`}
          >
            <SectionHeader
              icon={User}
              title="Informasi Akun"
              description="Data utama akun pengguna."
            />

            <div className="grid grid-cols-1 gap-5 p-5 sm:p-6 md:grid-cols-2">
              <FormInput
                label="Nama Lengkap"
                name="namaLengkap"
                value={form.namaLengkap}
                onChange={handleChange}
                placeholder="Masukkan nama lengkap"
                icon={User}
                required
              />

              <FormInput
                label="Username"
                name="namaPengguna"
                value={form.namaPengguna}
                onChange={handleChange}
                placeholder="Masukkan username"
                icon={User}
              />

              <FormInput
                label="Email"
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                placeholder="contoh@email.com"
                icon={Mail}
                required
              />

              <FormInput
                label="Password Baru"
                name="kataSandi"
                type="password"
                value={form.kataSandi}
                onChange={handleChange}
                placeholder="Kosongkan jika tidak diubah"
                icon={ShieldCheck}
                autoComplete="new-password"
              />
            </div>
          </section>

          <section
            className={`overflow-hidden rounded-2xl border theme-border theme-card ${themeCardShadow}`}
          >
            <SectionHeader
              icon={ShieldCheck}
              title="Role & Akses"
              description="Pengaturan role dan status akun pengguna."
            />

            <div className="grid grid-cols-1 gap-5 p-5 sm:p-6 md:grid-cols-2">
              <FormInput
                label="Role ID"
                name="peranId"
                value={form.peranId}
                onChange={handleChange}
                placeholder="ID role"
                icon={ShieldCheck}
              />

              <FormSelect
                label="Status"
                name="status"
                value={form.status}
                onChange={handleChange}
                icon={CheckCircle2}
                options={[
                  { value: "aktif", label: "Aktif" },
                  { value: "nonaktif", label: "Nonaktif" },
                ]}
              />
            </div>
          </section>

          <section
            className={`overflow-hidden rounded-2xl border theme-border theme-card ${themeCardShadow}`}
          >
            <SectionHeader
              icon={Building2}
              title="Relasi Sekolah & Yayasan"
              description="Hubungan akun dengan sekolah atau yayasan."
            />

            <div className="grid grid-cols-1 gap-5 p-5 sm:p-6 md:grid-cols-2">
              <FormInput
                label="Sekolah ID"
                name="sekolahId"
                value={form.sekolahId}
                onChange={handleChange}
                placeholder="ID sekolah"
                icon={Building2}
              />

              <FormInput
                label="Yayasan ID"
                name="yayasanId"
                value={form.yayasanId}
                onChange={handleChange}
                placeholder="ID yayasan"
                icon={Landmark}
              />
            </div>
          </section>

          <section
            className={`overflow-hidden rounded-2xl border theme-border theme-card ${themeCardShadow}`}
          >
            <SectionHeader
              icon={GraduationCap}
              title="Data Identitas"
              description="Informasi identitas dan data kepegawaian pengguna."
            />

            <div className="grid grid-cols-1 gap-5 p-5 sm:p-6 md:grid-cols-2">
              <FormSelect
                label="Jenis Kelamin"
                name="jenisKelamin"
                value={form.jenisKelamin}
                onChange={handleChange}
                icon={Users}
                options={[
                  { value: "", label: "Pilih jenis kelamin" },
                  { value: "L", label: "Laki-laki" },
                  { value: "P", label: "Perempuan" },
                ]}
              />

              <FormInput
                label="NIP"
                name="nip"
                value={form.nip}
                onChange={handleChange}
                placeholder="Nomor Induk Pegawai"
                icon={BriefcaseBusiness}
              />

              <FormInput
                label="NIPD"
                name="nipd"
                value={form.nipd}
                onChange={handleChange}
                placeholder="Nomor Induk Peserta Didik"
                icon={GraduationCap}
              />

              <FormInput
                label="NISN"
                name="nisn"
                value={form.nisn}
                onChange={handleChange}
                placeholder="Nomor Induk Siswa Nasional"
                icon={GraduationCap}
              />

              {!isSiswa && (
                <FormInput
                  label="Jabatan"
                  name="jabatan"
                  value={form.jabatan}
                  onChange={handleChange}
                  placeholder="Contoh: Guru"
                  icon={BriefcaseBusiness}
                />
              )}

              <FormInput
                label="Golongan"
                name="golongan"
                value={form.golongan}
                onChange={handleChange}
                placeholder="Contoh: III/a"
                icon={BriefcaseBusiness}
              />
            </div>
          </section>

          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={() =>
                router.push("/super-admin/kelola-user")
              }
              disabled={saving}
              className={`inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl border theme-border theme-card px-5 text-sm font-semibold theme-text-secondary transition ${themeNeutralHover} disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto`}
            >
              Batal
            </button>

            <button
              type="submit"
              disabled={saving}
              className={`inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl ${themePrimaryGradient} px-6 text-sm font-bold text-[var(--color-card)] ${themePrimaryShadow} transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto`}
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
    </div>
  );
}


function SectionHeader({ icon: Icon, title, description }) {
  return (
    <div
      className={`flex items-start gap-3 border-b ${themeDivider} ${themeNeutralSurface} px-5 py-5 sm:px-6`}
    >
      <div
        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${themePrimarySoft} ${themePrimaryText}`}
      >
        <Icon className="h-5 w-5" />
      </div>

      <div className="min-w-0">
        <h2 className="font-bold theme-text">{title}</h2>

        <p className="mt-0.5 text-xs theme-text-muted">
          {description}
        </p>
      </div>
    </div>
  );
}


function FormInput({
  label,
  name,
  value,
  onChange,
  placeholder,
  type = "text",
  icon: Icon,
  required = false,
  autoComplete,
}) {
  return (
    <div className="min-w-0">
      <label
        htmlFor={name}
        className="mb-2 block text-sm font-semibold theme-text-secondary"
      >
        {label}
        {required && (
          <span className={`ml-1 ${themePrimaryText}`}>*</span>
        )}
      </label>

      <div className="relative">
        {Icon && (
          <Icon className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 theme-text-muted" />
        )}

        <input
          id={name}
          type={type}
          name={name}
          value={value ?? ""}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          autoComplete={autoComplete}
          className={`theme-input h-11 w-full rounded-xl text-sm outline-none transition ${themeFocus} ${
            Icon ? "pl-10 pr-4" : "px-4"
          }`}
        />
      </div>
    </div>
  );
}


function FormSelect({
  label,
  name,
  value,
  onChange,
  options,
  icon: Icon,
}) {
  return (
    <div className="min-w-0">
      <label
        htmlFor={name}
        className="mb-2 block text-sm font-semibold theme-text-secondary"
      >
        {label}
      </label>

      <div className="relative">
        {Icon && (
          <Icon className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 theme-text-muted" />
        )}

        <select
          id={name}
          name={name}
          value={value ?? ""}
          onChange={onChange}
          className={`theme-input h-11 w-full appearance-none rounded-xl pr-10 text-sm outline-none transition ${themeFocus} ${
            Icon ? "pl-10" : "pl-4"
          }`}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

        <span className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 theme-text-muted">
          ▾
        </span>
      </div>
    </div>
  );
}