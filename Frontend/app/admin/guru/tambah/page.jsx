"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import Header from "../../../components/Header";
import Sidebar from "../../../components/Sidebar";

import { createUser, getUsers } from "../../../../services/user.service";

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

        console.error(
          "Gagal mengambil role guru:",
          err
        );

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
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())
    ) {
      result.email = "Format email tidak valid.";
    }

    if (!form.kataSandi.trim()) {
      result.kataSandi = "Kata sandi wajib diisi.";
    } else if (form.kataSandi.length < 6) {
      result.kataSandi = "Kata sandi minimal 6 karakter.";
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
        alamatDomisili: form.alamatDomisili.trim() || null,
        kecamatan: form.kecamatan.trim() || null,
        kelurahan: form.kelurahan.trim() || null,
        kota: form.kota.trim() || null,
      };

      const response = await createUser(payload);

      if (!response?.success) {
        throw new Error(
          response?.message || "Gagal menambahkan guru."
        );
      }

      setSuccess(
        response?.message || "Guru berhasil ditambahkan."
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
      <p className="mt-1.5 flex items-center gap-1 text-xs text-red-600">
        <AlertCircle size={13} />
        {validation[name]}
      </p>
    );
  }

  function SectionTitle({ icon: Icon, title, description }) {
    return (
      <div className="mb-6 flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
          <Icon size={20} />
        </div>

        <div>
          <h2 className="text-base font-bold text-slate-900">
            {title}
          </h2>

          {description && (
            <p className="mt-0.5 text-sm text-slate-500">
              {description}
            </p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-[#F8FAFC]">
      <Sidebar role="admin" />

      <div className="flex h-screen flex-1 flex-col overflow-hidden">
        <Header />

        <main className="flex-1 overflow-y-auto px-6 py-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <button
                  type="button"
                  onClick={() => router.push("/admin/guru")}
                  className="mb-3 inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-blue-600"
                >
                  <ArrowLeft size={17} />
                  Kembali ke Data Guru
                </button>

                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-lg shadow-blue-200">
                    <UserPlus size={24} />
                  </div>

                  <div>
                    <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                      Tambah Guru
                    </h1>

                    <p className="mt-1 text-sm text-slate-500">
                      Tambahkan data guru baru ke sistem SmartSchool.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleReset}
                  disabled={loading}
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-600 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <X size={17} />
                  Reset
                </button>

                <button
                  type="submit"
                  form="form-tambah-guru"
                  disabled={
                    loading || loadingRole || !guruRoleId
                  }
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 text-sm font-semibold text-white shadow-lg shadow-blue-200 transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:shadow-none"
                >
                  {loading ? (
                    <>
                      <Loader2 size={17} className="animate-spin" />
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

            {error && (
              <div className="mb-5 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3.5 text-red-700">
                <AlertCircle size={20} className="mt-0.5 shrink-0" />

                <div>
                  <p className="text-sm font-semibold">
                    Terjadi kesalahan
                  </p>

                  <p className="mt-0.5 text-sm">{error}</p>
                </div>
              </div>
            )}

            {success && (
              <div className="mb-5 flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3.5 text-emerald-700">
                <CheckCircle2 size={20} className="mt-0.5 shrink-0" />

                <div>
                  <p className="text-sm font-semibold">Berhasil</p>

                  <p className="mt-0.5 text-sm">{success}</p>
                </div>
              </div>
            )}

            <div className="mb-5 rounded-2xl border border-blue-100 bg-blue-50/70 p-4">
              <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-600 text-white">
                  {loadingRole ? (
                    <Loader2 size={18} className="animate-spin" />
                  ) : (
                    <ShieldCheck size={18} />
                  )}
                </div>

                <div>
                  <p className="text-sm font-semibold text-blue-900">
                    Role pengguna
                  </p>

                  <p className="mt-0.5 text-xs leading-5 text-blue-700">
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
              <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <SectionTitle
                  icon={Lock}
                  title="Akun Pengguna"
                  description="Data ini digunakan guru untuk login ke SmartSchool."
                />

                <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                      Nama Lengkap{" "}
                      <span className="text-red-500">*</span>
                    </label>

                    <div className="relative">
                      <User
                        size={18}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                      />

                      <input
                        ref={namaInputRef}
                        type="text"
                        name="namaLengkap"
                        value={form.namaLengkap}
                        onChange={handleNamaChange}
                        placeholder="Contoh: Budi Santoso"
                        className={`h-11 w-full rounded-xl border bg-white pl-10 pr-4 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:ring-4 ${
                          touched.namaLengkap &&
                          validation.namaLengkap
                            ? "border-red-300 focus:border-red-400 focus:ring-red-50"
                            : "border-slate-200 focus:border-blue-500 focus:ring-blue-50"
                        }`}
                      />
                    </div>

                    <FieldError name="namaLengkap" />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                      Username{" "}
                      <span className="text-red-500">*</span>
                    </label>

                    <div className="relative">
                      <User
                        size={18}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                      />

                      <input
                        type="text"
                        name="namaPengguna"
                        value={form.namaPengguna}
                        onChange={handleUsernameChange}
                        placeholder="Contoh: budi.santoso"
                        className={`h-11 w-full rounded-xl border bg-white pl-10 pr-4 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:ring-4 ${
                          touched.namaPengguna &&
                          validation.namaPengguna
                            ? "border-red-300 focus:border-red-400 focus:ring-red-50"
                            : "border-slate-200 focus:border-blue-500 focus:ring-blue-50"
                        }`}
                      />
                    </div>

                    <p className="mt-1.5 text-xs text-slate-400">
                      Username digunakan saat login.
                    </p>

                    <FieldError name="namaPengguna" />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                      Email{" "}
                      <span className="text-red-500">*</span>
                    </label>

                    <div className="relative">
                      <Mail
                        size={18}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                      />

                      <input
                        type="email"
                        name="email"
                        value={form.email}
                        onChange={handleChange}
                        placeholder="guru@smartschool.com"
                        className={`h-11 w-full rounded-xl border bg-white pl-10 pr-4 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:ring-4 ${
                          touched.email && validation.email
                            ? "border-red-300 focus:border-red-400 focus:ring-red-50"
                            : "border-slate-200 focus:border-blue-500 focus:ring-blue-50"
                        }`}
                      />
                    </div>

                    <FieldError name="email" />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                      Kata Sandi{" "}
                      <span className="text-red-500">*</span>
                    </label>

                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <Lock
                          size={18}
                          className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                        />

                        <input
                          type={showPassword ? "text" : "password"}
                          name="kataSandi"
                          value={form.kataSandi}
                          onChange={handleChange}
                          placeholder="Minimal 6 karakter"
                          className={`h-11 w-full rounded-xl border bg-white pl-10 pr-11 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:ring-4 ${
                            touched.kataSandi &&
                            validation.kataSandi
                              ? "border-red-300 focus:border-red-400 focus:ring-red-50"
                              : "border-slate-200 focus:border-blue-500 focus:ring-blue-50"
                          }`}
                        />

                        <button
                          type="button"
                          onClick={() =>
                            setShowPassword((prev) => !prev)
                          }
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-slate-700"
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
                        onClick={handleGeneratePassword}
                        className="h-11 shrink-0 rounded-xl border border-blue-200 bg-blue-50 px-3 text-xs font-semibold text-blue-700 transition hover:bg-blue-100"
                      >
                        Generate
                      </button>
                    </div>

                    <FieldError name="kataSandi" />
                  </div>
                </div>
              </section>

              <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <SectionTitle
                  icon={BriefcaseBusiness}
                  title="Data Kepegawaian"
                  description="Informasi identitas dan data kepegawaian guru."
                />

                <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                      NIP
                    </label>

                    <div className="relative">
                      <Hash
                        size={18}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                      />

                      <input
                        type="text"
                        name="nip"
                        value={form.nip}
                        onChange={handleChange}
                        placeholder="Contoh: 198501012010011001"
                        className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-50"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                      NUPTK
                    </label>

                    <div className="relative">
                      <Hash
                        size={18}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                      />

                      <input
                        type="text"
                        name="nuptk"
                        value={form.nuptk}
                        onChange={handleChange}
                        placeholder="Masukkan NUPTK"
                        className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-50"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                      Jabatan
                    </label>

                    <input
                      type="text"
                      name="jabatan"
                      value={form.jabatan}
                      onChange={handleChange}
                      placeholder="Guru"
                      className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-50"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                      Golongan
                    </label>

                    <select
                      name="golongan"
                      value={form.golongan}
                      onChange={handleChange}
                      className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-800 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-50"
                    >
                      <option value="">Pilih golongan</option>
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

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                      Jenis Kelamin
                    </label>

                    <select
                      name="jenisKelamin"
                      value={form.jenisKelamin}
                      onChange={handleChange}
                      className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-800 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-50"
                    >
                      <option value="L">Laki-laki</option>
                      <option value="P">Perempuan</option>
                    </select>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                      NIK
                    </label>

                    <div className="relative">
                      <Hash
                        size={18}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                      />

                      <input
                        type="text"
                        name="nik"
                        value={form.nik}
                        onChange={handleChange}
                        placeholder="16 digit NIK"
                        maxLength={16}
                        className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-50"
                      />
                    </div>
                  </div>
                </div>
              </section>

              <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <SectionTitle
                  icon={User}
                  title="Data Pribadi"
                  description="Informasi pribadi guru."
                />

                <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                      Tempat Lahir
                    </label>

                    <input
                      type="text"
                      name="tempatLahir"
                      value={form.tempatLahir}
                      onChange={handleChange}
                      placeholder="Contoh: Jakarta"
                      className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-50"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                      Tanggal Lahir
                    </label>

                    <div className="relative">
                      <CalendarDays
                        size={18}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                      />

                      <input
                        type="date"
                        name="tanggalLahir"
                        value={form.tanggalLahir}
                        onChange={handleChange}
                        className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 text-sm text-slate-800 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-50"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                      No. Telepon
                    </label>

                    <div className="relative">
                      <Phone
                        size={18}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                      />

                      <input
                        type="tel"
                        name="noTelepon"
                        value={form.noTelepon}
                        onChange={handleChange}
                        placeholder="08xxxxxxxxxx"
                        className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-50"
                      />
                    </div>
                  </div>
                </div>
              </section>

              <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <SectionTitle
                  icon={MapPin}
                  title="Alamat"
                  description="Informasi alamat tempat tinggal guru."
                />

                <div className="space-y-5">
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                      Alamat
                    </label>

                    <textarea
                      name="alamat"
                      value={form.alamat}
                      onChange={handleChange}
                      rows={3}
                      placeholder="Masukkan alamat lengkap..."
                      className="w-full resize-none rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-50"
                    />
                  </div>

                  <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                    <div>
                      <label className="mb-2 block text-sm font-semibold text-slate-700">
                        Alamat KTP
                      </label>

                      <textarea
                        name="alamatKtp"
                        value={form.alamatKtp}
                        onChange={handleChange}
                        rows={3}
                        placeholder="Alamat sesuai KTP..."
                        className="w-full resize-none rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-50"
                      />
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-semibold text-slate-700">
                        Alamat Domisili
                      </label>

                      <textarea
                        name="alamatDomisili"
                        value={form.alamatDomisili}
                        onChange={handleChange}
                        rows={3}
                        placeholder="Alamat tempat tinggal saat ini..."
                        className="w-full resize-none rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-50"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-4">
                    <div>
                      <label className="mb-2 block text-sm font-semibold text-slate-700">
                        Kecamatan
                      </label>

                      <input
                        type="text"
                        name="kecamatan"
                        value={form.kecamatan}
                        onChange={handleChange}
                        placeholder="Kecamatan"
                        className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-50"
                      />
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-semibold text-slate-700">
                        Kelurahan
                      </label>

                      <input
                        type="text"
                        name="kelurahan"
                        value={form.kelurahan}
                        onChange={handleChange}
                        placeholder="Kelurahan"
                        className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-50"
                      />
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-semibold text-slate-700">
                        Kota / Kabupaten
                      </label>

                      <input
                        type="text"
                        name="kota"
                        value={form.kota}
                        onChange={handleChange}
                        placeholder="Kota / Kabupaten"
                        className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-50"
                      />
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-semibold text-slate-700">
                        Status
                      </label>

                      <div className="flex h-11 items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4">
                        <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />

                        <span className="text-sm font-medium text-slate-700">
                          Aktif
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              <section className="rounded-2xl border border-amber-200 bg-amber-50/60 p-5">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-700">
                    <BookOpen size={20} />
                  </div>

                  <div>
                    <h3 className="text-sm font-bold text-amber-900">
                      Penugasan Mata Pelajaran
                    </h3>

                    <p className="mt-1 text-sm leading-6 text-amber-800">
                      Data guru pada halaman ini disimpan melalui endpoint
                      pengguna. Berdasarkan schema backend kamu, mata
                      pelajaran tidak disimpan langsung pada tabel Pengguna.
                      Penugasan guru ke mata pelajaran dilakukan melalui
                      relasi <b>KelasMapel</b>.
                    </p>
                  </div>
                </div>
              </section>

              <div className="flex flex-col-reverse gap-3 border-t border-slate-200 pt-5 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={() => router.push("/admin/guru")}
                  disabled={loading}
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <X size={17} />
                  Batal
                </button>

                <button
                  type="submit"
                  disabled={
                    loading || loadingRole || !guruRoleId
                  }
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 text-sm font-semibold text-white shadow-lg shadow-blue-200 transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:shadow-none"
                >
                  {loading ? (
                    <>
                      <Loader2 size={17} className="animate-spin" />
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