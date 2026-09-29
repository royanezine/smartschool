"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

import Sidebar from "../../../components/Sidebar";
import Header from "../../../components/Header";

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

import { createUser } from "../../../../services/user.service";

export default function TambahUserPage() {
  const router = useRouter();

  const [sidebarOpen, setSidebarOpen] = useState(false);

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
    if (!form.namaLengkap.trim()) return "Nama lengkap wajib diisi.";
    if (!form.email.trim()) return "Email wajib diisi.";
    if (!isValidEmail(form.email)) return "Format email tidak valid.";
    if (!form.kataSandi) return "Kata sandi wajib diisi.";
    if (form.kataSandi.length < 6) return "Kata sandi minimal 6 karakter.";
    if (form.kataSandi !== form.konfirmasiKataSandi)
      return "Konfirmasi kata sandi tidak sama.";
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
      setError(err?.message || "Gagal menambahkan pengguna.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-slate-100">
      <Sidebar
        role="super-admin"
        open={sidebarOpen}
        setOpen={setSidebarOpen}
      />

      <div className="flex h-screen flex-1 flex-col overflow-hidden">
        <Header onMenuClick={() => setSidebarOpen(true)} />

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="mx-auto w-full max-w-[1400px]">
            <section className="relative mb-6 overflow-hidden rounded-3xl bg-gradient-to-br from-[#0D47C9] via-blue-700 to-indigo-700 p-6 shadow-lg md:p-8">
              <div className="absolute -right-20 -top-28 h-72 w-72 rounded-full bg-white/10 blur-2xl" />
              <div className="absolute -bottom-32 left-1/3 h-80 w-80 rounded-full bg-blue-400/20 blur-3xl" />
              <div
                className="absolute inset-0 opacity-[0.07]"
                style={{
                  backgroundImage:
                    "linear-gradient(rgba(255,255,255,.8) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.8) 1px, transparent 1px)",
                  backgroundSize: "32px 32px",
                }}
              />

              <div className="relative flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-start gap-4">
                  <Link
                    href="/super-admin/kelola-user"
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/20 bg-white/10 text-white backdrop-blur-sm transition hover:bg-white/20"
                  >
                    <ArrowLeft className="h-5 w-5" />
                  </Link>

                  <div>
                    <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-semibold text-blue-50 backdrop-blur-sm">
                      <UserPlus className="h-3.5 w-3.5" />
                      MANAJEMEN PENGGUNA
                    </div>

                    <h1 className="text-2xl font-bold tracking-tight text-white md:text-3xl">
                      Tambah User Baru
                    </h1>

                    <p className="mt-2 max-w-2xl text-sm leading-6 text-blue-100">
                      Lengkapi informasi di bawah untuk membuat akun
                      pengguna baru di sistem SmartSchool.
                    </p>
                  </div>
                </div>

                <Link
                  href="/super-admin/kelola-user"
                  className="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/10 px-5 text-sm font-semibold text-white backdrop-blur-md transition hover:bg-white/20"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Kembali
                </Link>
              </div>
            </section>

            {error && (
              <div className="mb-6 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-red-100">
                  <AlertCircle className="h-5 w-5 text-red-600" />
                </div>

                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-red-800">
                    Gagal menyimpan data
                  </p>

                  <p className="mt-1 text-sm leading-5 text-red-700">
                    {error}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setError("")}
                  className="shrink-0 rounded-lg p-1.5 text-red-400 transition hover:bg-red-100 hover:text-red-600"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            )}

            {success && (
              <div className="mb-6 flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-100">
                  <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                </div>

                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-emerald-800">
                    Berhasil
                  </p>

                  <p className="mt-1 text-sm leading-5 text-emerald-700">
                    {success}
                  </p>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1fr_360px]">
                <div className="space-y-6">
                  <section className="overflow-hidden rounded-2xl border border-blue-100 bg-white shadow-sm">
                    <SectionHeader
                      icon={User}
                      title="Informasi Dasar"
                      description="Informasi utama pengguna."
                      color="blue"
                    />

                    <div className="grid grid-cols-1 gap-5 bg-blue-50/40 p-5 sm:grid-cols-2 lg:p-6">
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
                          { value: "", label: "Pilih jenis kelamin" },
                          { value: "L", label: "Laki-laki" },
                          { value: "P", label: "Perempuan" },
                        ]}
                      />
                    </div>
                  </section>

                  <section className="overflow-hidden rounded-2xl border border-indigo-100 bg-white shadow-sm">
                    <SectionHeader
                      icon={ShieldCheck}
                      title="Akses Akun"
                      description="Role, kata sandi, dan status akun."
                      color="indigo"
                    />

                    <div className="grid grid-cols-1 gap-5 bg-indigo-50/40 p-5 sm:grid-cols-2 lg:p-6">
                      <SelectField
                        label="Role"
                        name="peranId"
                        value={form.peranId}
                        onChange={handleChange}
                        options={[
                          { value: "", label: "Pilih role" },
                          { value: "super_admin", label: "Super Admin" },
                          { value: "admin_sekolah", label: "Admin Sekolah" },
                          { value: "guru", label: "Guru" },
                          { value: "siswa", label: "Siswa" },
                          { value: "yayasan", label: "Yayasan" },
                        ]}
                        helper="Jika backend pakai UUID role, isi ID role."
                      />

                      <SelectField
                        label="Status"
                        name="status"
                        value={form.status}
                        onChange={handleChange}
                        options={[
                          { value: "aktif", label: "Aktif" },
                          { value: "nonaktif", label: "Nonaktif" },
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

                  <section className="overflow-hidden rounded-2xl border border-cyan-100 bg-white shadow-sm">
                    <SectionHeader
                      icon={Building2}
                      title="Organisasi & Tenant"
                      description="Hubungkan pengguna dengan sekolah atau yayasan."
                      color="cyan"
                    />

                    <div className="grid grid-cols-1 gap-5 bg-cyan-50/40 p-5 sm:grid-cols-2 lg:p-6">
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

                  <section className="overflow-hidden rounded-2xl border border-emerald-100 bg-white shadow-sm">
                    <SectionHeader
                      icon={GraduationCap}
                      title="Data Akademik & Kepegawaian"
                      description="Data tambahan pengguna."
                      color="emerald"
                    />

                    <div className="grid grid-cols-1 gap-5 bg-emerald-50/40 p-5 sm:grid-cols-2 lg:p-6">
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

                <aside className="xl:sticky xl:top-0 xl:self-start">
                  <div className="space-y-4">
                    <PreviewCard form={form} />

                    <TipsCard />

                    <div className="overflow-hidden rounded-2xl border border-blue-200 bg-gradient-to-br from-blue-600 to-indigo-700 p-5 shadow-md">
                      <div className="mb-4 flex items-center gap-2">
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/15 text-white backdrop-blur-sm">
                          <Save className="h-4 w-4" />
                        </div>

                        <h3 className="text-sm font-bold text-white">
                          Simpan Perubahan
                        </h3>
                      </div>

                      <p className="mb-4 text-xs leading-5 text-blue-100">
                        Pastikan seluruh data sudah benar sebelum
                        menyimpan.
                      </p>

                      <div className="space-y-2">
                        <button
                          type="submit"
                          disabled={loading}
                          className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-white px-5 text-sm font-bold text-blue-700 shadow-sm transition hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-60"
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
                          className="inline-flex h-11 w-full items-center justify-center rounded-xl border border-white/20 bg-white/10 px-5 text-sm font-semibold text-white backdrop-blur-sm transition hover:bg-white/20"
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
        </main>
      </div>
    </div>
  );
}

function SectionHeader({ icon: Icon, title, description, color = "blue" }) {
  const colors = {
    blue: {
      wrap: "border-blue-100 bg-gradient-to-r from-blue-50 to-white",
      icon: "bg-blue-600 text-white",
    },
    indigo: {
      wrap: "border-indigo-100 bg-gradient-to-r from-indigo-50 to-white",
      icon: "bg-indigo-600 text-white",
    },
    cyan: {
      wrap: "border-cyan-100 bg-gradient-to-r from-cyan-50 to-white",
      icon: "bg-cyan-600 text-white",
    },
    emerald: {
      wrap: "border-emerald-100 bg-gradient-to-r from-emerald-50 to-white",
      icon: "bg-emerald-600 text-white",
    },
  };

  const c = colors[color] || colors.blue;

  return (
    <div
      className={`flex items-start gap-3 border-b px-5 py-5 lg:px-6 ${c.wrap}`}
    >
      <div
        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl shadow-sm ${c.icon}`}
      >
        <Icon size={19} />
      </div>

      <div>
        <h2 className="text-base font-bold text-slate-900">
          {title}
        </h2>

        <p className="mt-1 text-xs leading-5 text-slate-500">
          {description}
        </p>
      </div>
    </div>
  );
}

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
        className="mb-2 block text-sm font-semibold text-slate-700"
      >
        {label}

        {required && (
          <span className="ml-1 text-red-500">*</span>
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
        className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-800 shadow-sm outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
      />

      {helper && (
        <p className="mt-1.5 text-xs text-slate-400">
          {helper}
        </p>
      )}
    </div>
  );
}

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
        className="mb-2 block text-sm font-semibold text-slate-700"
      >
        {label}
      </label>

      <select
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-800 shadow-sm outline-none transition hover:border-slate-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>

      {helper && (
        <p className="mt-1.5 text-xs leading-5 text-slate-400">
          {helper}
        </p>
      )}
    </div>
  );
}

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
        className="mb-2 block text-sm font-semibold text-slate-700"
      >
        {label}

        {required && (
          <span className="ml-1 text-red-500">*</span>
        )}
      </label>

      <div className="relative">
        <Lock
          size={17}
          className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
        />

        <input
          id={name}
          name={name}
          type={showPassword ? "text" : "password"}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-11 text-sm text-slate-800 shadow-sm outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
        />

        <button
          type="button"
          onClick={onToggle}
          className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1 text-slate-400 transition hover:text-slate-700"
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

function PreviewCard({ form }) {
  const name = form.namaLengkap?.trim() || "Pengguna Baru";
  const initial = name.charAt(0).toUpperCase();

  const role = formatRole(form.peranId);
  const status = form.status === "aktif" ? "Aktif" : "Nonaktif";

  const isActive = form.status === "aktif";

  return (
    <div className="overflow-hidden rounded-2xl border border-blue-100 bg-white shadow-sm">
      <div className="flex items-center gap-2 border-b border-blue-100 bg-gradient-to-r from-blue-50 to-indigo-50 px-5 py-4">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600 text-white shadow-sm">
          <Sparkles className="h-4 w-4" />
        </div>

        <h3 className="text-sm font-bold text-slate-900">
          Preview Akun
        </h3>
      </div>

      <div className="bg-gradient-to-br from-blue-50/60 to-indigo-50/40 p-5">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 text-lg font-bold text-white shadow-md">
            {initial}
          </div>

          <div className="min-w-0">
            <p className="truncate text-sm font-bold text-slate-900">
              {name}
            </p>

            <p className="mt-0.5 truncate text-xs text-slate-500">
              {form.email?.trim() || "email@contoh.com"}
            </p>
          </div>
        </div>

        <div className="mt-4 space-y-2.5 rounded-xl border border-blue-100 bg-white/80 p-4 backdrop-blur-sm">
          <PreviewRow
            label="Username"
            value={form.namaPengguna?.trim() || "-"}
          />

          <PreviewRow label="Role" value={role} />

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
            <span className="text-xs text-slate-500">Status</span>

            <span
              className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border px-2.5 py-1 text-[11px] font-semibold ${
                isActive
                  ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                  : "border-slate-200 bg-slate-100 text-slate-600"
              }`}
            >
              {status}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

function PreviewRow({ label, value }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-xs text-slate-500">{label}</span>

      <span className="max-w-[60%] truncate text-xs font-semibold text-slate-800">
        {value}
      </span>
    </div>
  );
}

function TipsCard() {
  const items = [
    "Isi nama lengkap dan email wajib dengan benar.",
    "Gunakan kata sandi minimal 6 karakter.",
    "Pilih role sesuai hak akses pengguna.",
    "Isi data sekolah/yayasan untuk multi-tenant.",
  ];

  return (
    <div className="overflow-hidden rounded-2xl border border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50 shadow-sm">
      <div className="flex items-center gap-2 border-b border-amber-200 bg-amber-100/60 px-5 py-4">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-500 text-white shadow-sm">
          <Info className="h-4 w-4" />
        </div>

        <h3 className="text-sm font-bold text-amber-900">
          Panduan Cepat
        </h3>
      </div>

      <ul className="space-y-2.5 p-5">
        {items.map((item, i) => (
          <li key={i} className="flex items-start gap-2.5">
            <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-500" />

            <span className="text-xs leading-5 text-amber-900">
              {item}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function formatRole(role) {
  if (!role) return "Belum dipilih";

  const map = {
    super_admin: "Super Admin",
    admin_sekolah: "Admin Sekolah",
    guru: "Guru",
    siswa: "Siswa",
    yayasan: "Yayasan",
  };

  return map[role] || role;
}