"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import Header from "../../../../components/Header";
import Sidebar from "../../../../components/Sidebar";

import { createUser, getUsers } from "../../../../../services/user.service";

import {
  ArrowLeft,
  UserPlus,
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Phone,
  MapPin,
  BriefcaseBusiness,
  CalendarDays,
  Save,
  X,
  CheckCircle2,
  AlertCircle,
  Loader2,
  BookOpen,
  GraduationCap,
  Hash,
  ShieldCheck,
} from "lucide-react";

function generateUsername(nama) {
  const cleaned = String(nama || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s]/g, "")
    .replace(/\s+/g, ".");

  if (!cleaned) {
    return "";
  }

  return cleaned;
}

function generatePassword() {
  const chars =
    "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789";

  let password = "";

  for (let i = 0; i < 10; i++) {
    password += chars.charAt(
      Math.floor(Math.random() * chars.length)
    );
  }

  return password;
}

export default function TambahGuruPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [loadingRole, setLoadingRole] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [guruRoleId, setGuruRoleId] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [form, setForm] = useState({
    namaLengkap: "",
    namaPengguna: "",
    email: "",
    kataSandi: "",
    nip: "",
    nuptk: "",
    jenisKelamin: "L",
    tempatLahir: "",
    tanggalLahir: "",
    noTelepon: "",
    alamat: "",
    jabatan: "Guru",
    golongan: "",
    nik: "",
    alamatKtp: "",
    alamatDomisili: "",
    kecamatan: "",
    kelurahan: "",
    kota: "",
  });

  const [touched, setTouched] = useState({});
  const namaInputRef = useRef(null);

  useEffect(() => {
    let mounted = true;

    async function loadGuruRole() {
      try {
        setLoadingRole(true);
        setError("");

        const response = await getUsers({
          page: 1,
          limit: 1,
          role: "guru",
        });

        if (!mounted) return;

        const guru = Array.isArray(response?.data)
          ? response.data[0]
          : null;

        const roleId =
          guru?.peran?.id ||
          guru?.peranId ||
          "";

        if (roleId) {
          setGuruRoleId(roleId);
        } else {
          setError(
            "Role Guru belum dapat ditemukan. Pastikan sudah ada minimal satu pengguna dengan role guru di database."
          );
        }
      } catch (err) {
        if (!mounted) return;

        console.error("Gagal mengambil role guru:", err);

        setError(
          err?.message ||
            "Gagal mengambil data role guru."
        );
      } finally {
        if (mounted) {
          setLoadingRole(false);
        }
      }
    }

    loadGuruRole();

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      namaInputRef.current?.focus();
    }, 300);

    return () => clearTimeout(timer);
  }, []);

  function handleChange(event) {
    const { name, value } = event.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));

    setTouched((prev) => ({
      ...prev,
      [name]: true,
    }));

    if (error) {
      setError("");
    }

    if (success) {
      setSuccess("");
    }
  }

  function handleNamaChange(event) {
    const value = event.target.value;

    setForm((prev) => ({
      ...prev,
      namaLengkap: value,
      namaPengguna:
        prev.namaPengguna ||
        generateUsername(value),
    }));

    setTouched((prev) => ({
      ...prev,
      namaLengkap: true,
    }));

    if (error) {
      setError("");
    }
  }

  function handleUsernameChange(event) {
    const value = event.target.value
      .toLowerCase()
      .replace(/\s+/g, ".")
      .replace(/[^a-z0-9._-]/g, "");

    setForm((prev) => ({
      ...prev,
      namaPengguna: value,
    }));

    setTouched((prev) => ({
      ...prev,
      namaPengguna: true,
    }));

    if (error) {
      setError("");
    }
  }

  function handleGeneratePassword() {
    const password = generatePassword();

    setForm((prev) => ({
      ...prev,
      kataSandi: password,
    }));

    setTouched((prev) => ({
      ...prev,
      kataSandi: true,
    }));

    setShowPassword(true);

    if (error) {
      setError("");
    }
  }

  const validation = useMemo(() => {
    const result = {};

    if (!form.namaLengkap.trim()) {
      result.namaLengkap = "Nama lengkap wajib diisi.";
    }

    if (!form.namaPengguna.trim()) {
      result.namaPengguna = "Username wajib diisi.";
    }

    if (!form.email.trim()) {
      result.email = "Email wajib diisi.";
    } else if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
        form.email.trim()
      )
    ) {
      result.email = "Format email tidak valid.";
    }

    if (!form.kataSandi.trim()) {
      result.kataSandi = "Kata sandi wajib diisi.";
    } else if (form.kataSandi.length < 6) {
      result.kataSandi =
        "Kata sandi minimal 6 karakter.";
    }

    if (!guruRoleId) {
      result.role = "Role Guru belum tersedia.";
    }

    return result;
  }, [form, guruRoleId]);

  const isValid = Object.keys(validation).length === 0;

  async function handleSubmit(event) {
    event.preventDefault();

    setError("");
    setSuccess("");

    setTouched({
      namaLengkap: true,
      namaPengguna: true,
      email: true,
      kataSandi: true,
    });

    if (!isValid) {
      const firstError = Object.values(validation)[0];
      setError(firstError);
      return;
    }

    try {
      setLoading(true);

      const payload = {
        namaPengguna: form.namaPengguna.trim(),
        email: form.email.trim(),
        namaLengkap: form.namaLengkap.trim(),
        kataSandi: form.kataSandi,
        peranId: guruRoleId,
        nip: form.nip.trim() || null,
        nuptk: form.nuptk.trim() || null,
        jenisKelamin: form.jenisKelamin || null,
        tempatLahir: form.tempatLahir.trim() || null,
        tanggalLahir: form.tanggalLahir || null,
        noTelepon: form.noTelepon.trim() || null,
        alamat: form.alamat.trim() || null,
        jabatan: form.jabatan.trim() || null,
        golongan: form.golongan.trim() || null,
        nik: form.nik.trim() || null,
        alamatKtp: form.alamatKtp.trim() || null,
        alamatDomisili:
          form.alamatDomisili.trim() || null,
        kecamatan: form.kecamatan.trim() || null,
        kelurahan: form.kelurahan.trim() || null,
        kota: form.kota.trim() || null,
      };

      const response = await createUser(payload);

      if (!response?.success) {
        throw new Error(
          response?.message ||
            "Gagal menambahkan guru."
        );
      }

      setSuccess(
        response?.message ||
          "Guru berhasil ditambahkan."
      );

      setTimeout(() => {
        router.push("/admin/guru");
      }, 1000);
    } catch (err) {
      console.error("ERROR TAMBAH GURU:", err);

      setError(
        err?.message ||
          "Terjadi kesalahan saat menambahkan guru."
      );
    } finally {
      setLoading(false);
    }
  }

  function handleReset() {
    setForm({
      namaLengkap: "",
      namaPengguna: "",
      email: "",
      kataSandi: "",
      nip: "",
      nuptk: "",
      jenisKelamin: "L",
      tempatLahir: "",
      tanggalLahir: "",
      noTelepon: "",
      alamat: "",
      jabatan: "Guru",
      golongan: "",
      nik: "",
      alamatKtp: "",
      alamatDomisili: "",
      kecamatan: "",
      kelurahan: "",
      kota: "",
    });

    setTouched({});
    setError("");
    setSuccess("");
    setShowPassword(false);

    setTimeout(() => {
      namaInputRef.current?.focus();
    }, 100);
  }

  function FieldError({ name }) {
    if (!touched[name] || !validation[name]) {
      return null;
    }

    return (
      <p className="mt-1.5 flex items-center gap-1 text-xs text-[var(--color-danger)]">
        <AlertCircle size={13} />
        {validation[name]}
      </p>
    );
  }

  function SectionTitle({
    icon: Icon,
    title,
    description,
  }) {
    return (
      <div className="mb-6 flex items-start gap-3">
        <div className="theme-info flex h-10 w-10 shrink-0 items-center justify-center rounded-xl">
          <Icon size={20} />
        </div>

        <div>
          <h2 className="text-base font-bold theme-text">
            {title}
          </h2>

          {description && (
            <p className="mt-0.5 text-sm theme-text-muted">
              {description}
            </p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="theme-page flex h-screen overflow-hidden">
      <Sidebar role="admin" />

      <div className="flex h-screen flex-1 flex-col overflow-hidden">
        <Header />

        <main className="flex-1 overflow-y-auto px-6 py-6 lg:px-8">
          <div className="mx-auto max-w-7xl">

            {/* HEADER */}
            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <button
                  type="button"
                  onClick={() =>
                    router.push("/admin/guru")
                  }
                  className="mb-3 inline-flex items-center gap-2 text-sm font-medium theme-text-muted transition hover:text-[var(--color-primary)]"
                >
                  <ArrowLeft size={17} />
                  Kembali ke Data Guru
                </button>

                <div className="flex items-center gap-3">
                  <div className="theme-primary flex h-12 w-12 items-center justify-center rounded-2xl shadow-lg">
                    <UserPlus size={24} />
                  </div>

                  <div>
                    <h1 className="text-2xl font-bold tracking-tight theme-text">
                      Tambah Guru
                    </h1>

                    <p className="mt-1 text-sm theme-text-muted">
                      Tambahkan data guru baru ke sistem
                      SmartSchool.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleReset}
                  disabled={loading}
                  className="theme-card theme-border theme-text-secondary theme-header-hover inline-flex h-11 items-center justify-center gap-2 rounded-xl border px-4 text-sm font-semibold shadow-sm transition disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <X size={17} />
                  Reset
                </button>

                <button
                  type="submit"
                  form="form-tambah-guru"
                  disabled={
                    loading ||
                    loadingRole ||
                    !guruRoleId
                  }
                  className="theme-primary inline-flex h-11 items-center justify-center gap-2 rounded-xl px-5 text-sm font-semibold shadow-lg transition disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none"
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
                      <Save size={17} />
                      Simpan Guru
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* ERROR */}
            {error && (
              <div className="theme-danger theme-border mb-5 flex items-start gap-3 rounded-2xl border px-4 py-3.5">
                <AlertCircle
                  size={20}
                  className="mt-0.5 shrink-0"
                />

                <div>
                  <p className="text-sm font-semibold">
                    Terjadi kesalahan
                  </p>

                  <p className="mt-0.5 text-sm">
                    {error}
                  </p>
                </div>
              </div>
            )}

            {/* SUCCESS */}
            {success && (
              <div className="theme-success theme-border mb-5 flex items-start gap-3 rounded-2xl border px-4 py-3.5">
                <CheckCircle2
                  size={20}
                  className="mt-0.5 shrink-0"
                />

                <div>
                  <p className="text-sm font-semibold">
                    Berhasil
                  </p>

                  <p className="mt-0.5 text-sm">
                    {success}
                  </p>
                </div>
              </div>
            )}

            {/* ROLE INFO */}
            <div className="theme-info theme-border mb-5 rounded-2xl border p-4">
              <div className="flex items-start gap-3">
                <div className="theme-primary flex h-9 w-9 shrink-0 items-center justify-center rounded-lg">
                  {loadingRole ? (
                    <Loader2
                      size={18}
                      className="animate-spin"
                    />
                  ) : (
                    <ShieldCheck size={18} />
                  )}
                </div>

                <div>
                  <p className="text-sm font-semibold text-[var(--color-info)]">
                    Role pengguna
                  </p>

                  <p className="mt-0.5 text-xs leading-5 text-[var(--color-info)]">
                    {loadingRole
                      ? "Sedang mengambil role Guru dari backend..."
                      : guruRoleId
                      ? "Guru akan dibuat menggunakan role Guru yang tersimpan di database."
                      : "Role Guru belum ditemukan di database."}
                  </p>
                </div>
              </div>
            </div>

            <form
              id="form-tambah-guru"
              onSubmit={handleSubmit}
              className="space-y-5"
            >

              {/* AKUN PENGGUNA */}
              <section className="theme-card theme-border rounded-2xl border p-6 shadow-sm">
                <SectionTitle
                  icon={Lock}
                  title="Akun Pengguna"
                  description="Data ini digunakan guru untuk login ke SmartSchool."
                />

                <div className="grid grid-cols-1 gap-5 md:grid-cols-2">

                  {/* NAMA */}
                  <div>
                    <label className="theme-text-secondary mb-2 block text-sm font-semibold">
                      Nama Lengkap{" "}
                      <span className="text-[var(--color-danger)]">
                        *
                      </span>
                    </label>

                    <div className="relative">
                      <User
                        size={18}
                        className="theme-text-placeholder absolute left-3 top-1/2 -translate-y-1/2"
                      />

                      <input
                        ref={namaInputRef}
                        type="text"
                        name="namaLengkap"
                        value={form.namaLengkap}
                        onChange={handleNamaChange}
                        placeholder="Contoh: Budi Santoso"
                        className={`theme-input h-11 w-full rounded-xl border pl-10 pr-4 text-sm outline-none transition focus:ring-4 ${
                          touched.namaLengkap &&
                          validation.namaLengkap
                            ? "border-[var(--color-danger)] focus:border-[var(--color-danger)] focus:ring-[var(--color-danger)]/10"
                            : "focus:border-[var(--color-primary)] focus:ring-[var(--color-primary)]/10"
                        }`}
                      />
                    </div>

                    <FieldError name="namaLengkap" />
                  </div>

                  {/* USERNAME */}
                  <div>
                    <label className="theme-text-secondary mb-2 block text-sm font-semibold">
                      Username{" "}
                      <span className="text-[var(--color-danger)]">
                        *
                      </span>
                    </label>

                    <div className="relative">
                      <User
                        size={18}
                        className="theme-text-placeholder absolute left-3 top-1/2 -translate-y-1/2"
                      />

                      <input
                        type="text"
                        name="namaPengguna"
                        value={form.namaPengguna}
                        onChange={handleUsernameChange}
                        placeholder="Contoh: budi.santoso"
                        className={`theme-input h-11 w-full rounded-xl border pl-10 pr-4 text-sm outline-none transition focus:ring-4 ${
                          touched.namaPengguna &&
                          validation.namaPengguna
                            ? "border-[var(--color-danger)] focus:border-[var(--color-danger)] focus:ring-[var(--color-danger)]/10"
                            : "focus:border-[var(--color-primary)] focus:ring-[var(--color-primary)]/10"
                        }`}
                      />
                    </div>

                    <p className="theme-text-placeholder mt-1.5 text-xs">
                      Username digunakan saat login.
                    </p>

                    <FieldError name="namaPengguna" />
                  </div>

                  {/* EMAIL */}
                  <div>
                    <label className="theme-text-secondary mb-2 block text-sm font-semibold">
                      Email{" "}
                      <span className="text-[var(--color-danger)]">
                        *
                      </span>
                    </label>

                    <div className="relative">
                      <Mail
                        size={18}
                        className="theme-text-placeholder absolute left-3 top-1/2 -translate-y-1/2"
                      />

                      <input
                        type="email"
                        name="email"
                        value={form.email}
                        onChange={handleChange}
                        placeholder="guru@smartschool.com"
                        className={`theme-input h-11 w-full rounded-xl border pl-10 pr-4 text-sm outline-none transition focus:ring-4 ${
                          touched.email &&
                          validation.email
                            ? "border-[var(--color-danger)] focus:border-[var(--color-danger)] focus:ring-[var(--color-danger)]/10"
                            : "focus:border-[var(--color-primary)] focus:ring-[var(--color-primary)]/10"
                        }`}
                      />
                    </div>

                    <FieldError name="email" />
                  </div>

                  {/* PASSWORD */}
                  <div>
                    <label className="theme-text-secondary mb-2 block text-sm font-semibold">
                      Kata Sandi{" "}
                      <span className="text-[var(--color-danger)]">
                        *
                      </span>
                    </label>

                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <Lock
                          size={18}
                          className="theme-text-placeholder absolute left-3 top-1/2 -translate-y-1/2"
                        />

                        <input
                          type={
                            showPassword
                              ? "text"
                              : "password"
                          }
                          name="kataSandi"
                          value={form.kataSandi}
                          onChange={handleChange}
                          placeholder="Minimal 6 karakter"
                          className={`theme-input h-11 w-full rounded-xl border pl-10 pr-11 text-sm outline-none transition focus:ring-4 ${
                            touched.kataSandi &&
                            validation.kataSandi
                              ? "border-[var(--color-danger)] focus:border-[var(--color-danger)] focus:ring-[var(--color-danger)]/10"
                              : "focus:border-[var(--color-primary)] focus:ring-[var(--color-primary)]/10"
                          }`}
                        />

                        <button
                          type="button"
                          onClick={() =>
                            setShowPassword(
                              (prev) => !prev
                            )
                          }
                          className="theme-text-placeholder absolute right-3 top-1/2 -translate-y-1/2 transition hover:text-[var(--color-text)]"
                        >
                          {showPassword ? (
                            <EyeOff size={18} />
                          ) : (
                            <Eye size={18} />
                          )}
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={
                          handleGeneratePassword
                        }
                        className="theme-info theme-border h-11 shrink-0 rounded-xl border px-3 text-xs font-semibold transition hover:opacity-90"
                      >
                        Generate
                      </button>
                    </div>

                    <FieldError name="kataSandi" />
                  </div>
                </div>
              </section>

              {/* DATA KEPEGAWAIAN */}
              <section className="theme-card theme-border rounded-2xl border p-6 shadow-sm">
                <SectionTitle
                  icon={BriefcaseBusiness}
                  title="Data Kepegawaian"
                  description="Informasi identitas dan data kepegawaian guru."
                />

                <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">

                  {/* NIP */}
                  <div>
                    <label className="theme-text-secondary mb-2 block text-sm font-semibold">
                      NIP
                    </label>

                    <div className="relative">
                      <Hash
                        size={18}
                        className="theme-text-placeholder absolute left-3 top-1/2 -translate-y-1/2"
                      />

                      <input
                        type="text"
                        name="nip"
                        value={form.nip}
                        onChange={handleChange}
                        placeholder="Contoh: 198501012010011001"
                        className="theme-input h-11 w-full rounded-xl border pl-10 pr-4 text-sm outline-none transition focus:border-[var(--color-primary)] focus:ring-4 focus:ring-[var(--color-primary)]/10"
                      />
                    </div>
                  </div>

                  {/* NUPTK */}
                  <div>
                    <label className="theme-text-secondary mb-2 block text-sm font-semibold">
                      NUPTK
                    </label>

                    <div className="relative">
                      <Hash
                        size={18}
                        className="theme-text-placeholder absolute left-3 top-1/2 -translate-y-1/2"
                      />

                      <input
                        type="text"
                        name="nuptk"
                        value={form.nuptk}
                        onChange={handleChange}
                        placeholder="Masukkan NUPTK"
                        className="theme-input h-11 w-full rounded-xl border pl-10 pr-4 text-sm outline-none transition focus:border-[var(--color-primary)] focus:ring-4 focus:ring-[var(--color-primary)]/10"
                      />
                    </div>
                  </div>

                  {/* JABATAN */}
                  <div>
                    <label className="theme-text-secondary mb-2 block text-sm font-semibold">
                      Jabatan
                    </label>

                    <input
                      type="text"
                      name="jabatan"
                      value={form.jabatan}
                      onChange={handleChange}
                      placeholder="Guru"
                      className="theme-input h-11 w-full rounded-xl border px-4 text-sm outline-none transition focus:border-[var(--color-primary)] focus:ring-4 focus:ring-[var(--color-primary)]/10"
                    />
                  </div>

                  {/* GOLONGAN */}
                  <div>
                    <label className="theme-text-secondary mb-2 block text-sm font-semibold">
                      Golongan
                    </label>

                    <select
                      name="golongan"
                      value={form.golongan}
                      onChange={handleChange}
                      className="theme-input h-11 w-full rounded-xl border px-4 text-sm outline-none transition focus:border-[var(--color-primary)] focus:ring-4 focus:ring-[var(--color-primary)]/10"
                    >
                      <option value="">
                        Pilih golongan
                      </option>
                      <option value="III/a">III/a</option>
                      <option value="III/b">III/b</option>
                      <option value="III/c">III/c</option>
                      <option value="III/d">III/d</option>
                      <option value="IV/a">IV/a</option>
                      <option value="IV/b">IV/b</option>
                      <option value="IV/c">IV/c</option>
                      <option value="IV/d">IV/d</option>
                      <option value="IV/e">IV/e</option>
                    </select>
                  </div>

                  {/* JENIS KELAMIN */}
                  <div>
                    <label className="theme-text-secondary mb-2 block text-sm font-semibold">
                      Jenis Kelamin
                    </label>

                    <select
                      name="jenisKelamin"
                      value={form.jenisKelamin}
                      onChange={handleChange}
                      className="theme-input h-11 w-full rounded-xl border px-4 text-sm outline-none transition focus:border-[var(--color-primary)] focus:ring-4 focus:ring-[var(--color-primary)]/10"
                    >
                      <option value="L">
                        Laki-laki
                      </option>
                      <option value="P">
                        Perempuan
                      </option>
                    </select>
                  </div>

                  {/* NIK */}
                  <div>
                    <label className="theme-text-secondary mb-2 block text-sm font-semibold">
                      NIK
                    </label>

                    <div className="relative">
                      <Hash
                        size={18}
                        className="theme-text-placeholder absolute left-3 top-1/2 -translate-y-1/2"
                      />

                      <input
                        type="text"
                        name="nik"
                        value={form.nik}
                        onChange={handleChange}
                        placeholder="16 digit NIK"
                        maxLength={16}
                        className="theme-input h-11 w-full rounded-xl border pl-10 pr-4 text-sm outline-none transition focus:border-[var(--color-primary)] focus:ring-4 focus:ring-[var(--color-primary)]/10"
                      />
                    </div>
                  </div>
                </div>
              </section>

              {/* DATA PRIBADI */}
              <section className="theme-card theme-border rounded-2xl border p-6 shadow-sm">
                <SectionTitle
                  icon={User}
                  title="Data Pribadi"
                  description="Informasi pribadi guru."
                />

                <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">

                  {/* TEMPAT LAHIR */}
                  <div>
                    <label className="theme-text-secondary mb-2 block text-sm font-semibold">
                      Tempat Lahir
                    </label>

                    <input
                      type="text"
                      name="tempatLahir"
                      value={form.tempatLahir}
                      onChange={handleChange}
                      placeholder="Contoh: Jakarta"
                      className="theme-input h-11 w-full rounded-xl border px-4 text-sm outline-none transition focus:border-[var(--color-primary)] focus:ring-4 focus:ring-[var(--color-primary)]/10"
                    />
                  </div>

                  {/* TANGGAL LAHIR */}
                  <div>
                    <label className="theme-text-secondary mb-2 block text-sm font-semibold">
                      Tanggal Lahir
                    </label>

                    <div className="relative">
                      <CalendarDays
                        size={18}
                        className="theme-text-placeholder absolute left-3 top-1/2 -translate-y-1/2"
                      />

                      <input
                        type="date"
                        name="tanggalLahir"
                        value={form.tanggalLahir}
                        onChange={handleChange}
                        className="theme-input h-11 w-full rounded-xl border pl-10 pr-4 text-sm outline-none transition focus:border-[var(--color-primary)] focus:ring-4 focus:ring-[var(--color-primary)]/10"
                      />
                    </div>
                  </div>

                  {/* TELEPON */}
                  <div>
                    <label className="theme-text-secondary mb-2 block text-sm font-semibold">
                      No. Telepon
                    </label>

                    <div className="relative">
                      <Phone
                        size={18}
                        className="theme-text-placeholder absolute left-3 top-1/2 -translate-y-1/2"
                      />

                      <input
                        type="tel"
                        name="noTelepon"
                        value={form.noTelepon}
                        onChange={handleChange}
                        placeholder="08xxxxxxxxxx"
                        className="theme-input h-11 w-full rounded-xl border pl-10 pr-4 text-sm outline-none transition focus:border-[var(--color-primary)] focus:ring-4 focus:ring-[var(--color-primary)]/10"
                      />
                    </div>
                  </div>
                </div>
              </section>

              {/* ALAMAT */}
              <section className="theme-card theme-border rounded-2xl border p-6 shadow-sm">
                <SectionTitle
                  icon={MapPin}
                  title="Alamat"
                  description="Informasi alamat tempat tinggal guru."
                />

                <div className="space-y-5">

                  {/* ALAMAT */}
                  <div>
                    <label className="theme-text-secondary mb-2 block text-sm font-semibold">
                      Alamat
                    </label>

                    <textarea
                      name="alamat"
                      value={form.alamat}
                      onChange={handleChange}
                      rows={3}
                      placeholder="Masukkan alamat lengkap..."
                      className="theme-input w-full resize-none rounded-xl border px-4 py-3 text-sm outline-none transition focus:border-[var(--color-primary)] focus:ring-4 focus:ring-[var(--color-primary)]/10"
                    />
                  </div>

                  <div className="grid grid-cols-1 gap-5 md:grid-cols-2">

                    {/* ALAMAT KTP */}
                    <div>
                      <label className="theme-text-secondary mb-2 block text-sm font-semibold">
                        Alamat KTP
                      </label>

                      <textarea
                        name="alamatKtp"
                        value={form.alamatKtp}
                        onChange={handleChange}
                        rows={3}
                        placeholder="Alamat sesuai KTP..."
                        className="theme-input w-full resize-none rounded-xl border px-4 py-3 text-sm outline-none transition focus:border-[var(--color-primary)] focus:ring-4 focus:ring-[var(--color-primary)]/10"
                      />
                    </div>

                    {/* ALAMAT DOMISILI */}
                    <div>
                      <label className="theme-text-secondary mb-2 block text-sm font-semibold">
                        Alamat Domisili
                      </label>

                      <textarea
                        name="alamatDomisili"
                        value={form.alamatDomisili}
                        onChange={handleChange}
                        rows={3}
                        placeholder="Alamat tempat tinggal saat ini..."
                        className="theme-input w-full resize-none rounded-xl border px-4 py-3 text-sm outline-none transition focus:border-[var(--color-primary)] focus:ring-4 focus:ring-[var(--color-primary)]/10"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-4">

                    {/* KECAMATAN */}
                    <div>
                      <label className="theme-text-secondary mb-2 block text-sm font-semibold">
                        Kecamatan
                      </label>

                      <input
                        type="text"
                        name="kecamatan"
                        value={form.kecamatan}
                        onChange={handleChange}
                        placeholder="Kecamatan"
                        className="theme-input h-11 w-full rounded-xl border px-4 text-sm outline-none transition focus:border-[var(--color-primary)] focus:ring-4 focus:ring-[var(--color-primary)]/10"
                      />
                    </div>

                    {/* KELURAHAN */}
                    <div>
                      <label className="theme-text-secondary mb-2 block text-sm font-semibold">
                        Kelurahan
                      </label>

                      <input
                        type="text"
                        name="kelurahan"
                        value={form.kelurahan}
                        onChange={handleChange}
                        placeholder="Kelurahan"
                        className="theme-input h-11 w-full rounded-xl border px-4 text-sm outline-none transition focus:border-[var(--color-primary)] focus:ring-4 focus:ring-[var(--color-primary)]/10"
                      />
                    </div>

                    {/* KOTA */}
                    <div>
                      <label className="theme-text-secondary mb-2 block text-sm font-semibold">
                        Kota / Kabupaten
                      </label>

                      <input
                        type="text"
                        name="kota"
                        value={form.kota}
                        onChange={handleChange}
                        placeholder="Kota / Kabupaten"
                        className="theme-input h-11 w-full rounded-xl border px-4 text-sm outline-none transition focus:border-[var(--color-primary)] focus:ring-4 focus:ring-[var(--color-primary)]/10"
                      />
                    </div>

                    {/* STATUS */}
                    <div>
                      <label className="theme-text-secondary mb-2 block text-sm font-semibold">
                        Status
                      </label>

                      <div className="theme-card-soft theme-border flex h-11 items-center gap-2 rounded-xl border px-4">
                        <span className="h-2.5 w-2.5 rounded-full bg-[var(--color-success)]" />

                        <span className="theme-text-secondary text-sm font-medium">
                          Aktif
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* PENUGASAN MATA PELAJARAN */}
              <section className="theme-warning theme-border rounded-2xl border p-5">
                <div className="flex items-start gap-3">
                  <div className="theme-warning theme-border flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border">
                    <BookOpen size={20} />
                  </div>

                  <div>
                    <h3 className="text-sm font-bold text-[var(--color-warning)]">
                      Penugasan Mata Pelajaran
                    </h3>

                    <p className="mt-1 text-sm leading-6 text-[var(--color-warning)]">
                      Data guru pada halaman ini disimpan
                      melalui endpoint pengguna. Berdasarkan
                      schema backend kamu, mata pelajaran tidak
                      disimpan langsung pada tabel Pengguna.
                      Penugasan guru ke mata pelajaran dilakukan
                      melalui relasi <b>KelasMapel</b>.
                    </p>
                  </div>
                </div>
              </section>

              {/* FOOTER BUTTON */}
              <div className="theme-border flex flex-col-reverse gap-3 border-t pt-5 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={() =>
                    router.push("/admin/guru")
                  }
                  disabled={loading}
                  className="theme-card theme-border theme-text-secondary theme-header-hover inline-flex h-11 items-center justify-center gap-2 rounded-xl border px-5 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <X size={17} />
                  Batal
                </button>

                <button
                  type="submit"
                  disabled={
                    loading ||
                    loadingRole ||
                    !guruRoleId
                  }
                  className="theme-primary inline-flex h-11 items-center justify-center gap-2 rounded-xl px-6 text-sm font-semibold shadow-lg transition disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none"
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
                      <GraduationCap size={17} />
                      Simpan Guru
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