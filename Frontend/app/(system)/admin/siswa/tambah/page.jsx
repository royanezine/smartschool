
"use client";

import { useEffect, useState } from "react";
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
  KeyRound,
  ChevronDown,
  RefreshCw,
} from "lucide-react";

import Header from "@/app/components/Header";
import Sidebar from "@/app/components/Sidebar";
import { createSiswa } from "@/services/siswa.service";
import { apiFetch } from "@/lib/api";

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
   NORMALISASI RESPONSE KELAS
========================================================= */

function getClassList(response) {
  const candidates = [
    response?.data?.data,
    response?.data,
    response?.data?.kelas,
    response?.data?.items,
    response?.data?.rows,
    response?.data?.result,
    response?.data?.data?.kelas,
    response?.data?.data?.items,
    response?.data?.data?.rows,
    response?.data?.data?.result,
    response?.kelas,
    response?.items,
    response?.rows,
    response?.result,
    response?.data,
    response,
  ];

  return candidates.find(Array.isArray) || [];
}

function getClassId(item) {
  return item?.id ?? item?.kelasId ?? item?.uuid ?? "";
}

function getClassName(item) {
  return (
    item?.namaKelas ??
    item?.nama ??
    item?.nama_kelas ??
    item?.tingkatKelas?.nama ??
    item?.tingkat?.nama ??
    item?.kodeKelas ??
    item?.kode ??
    ""
  );
}

/* =========================================================
   MAIN PAGE
========================================================= */

export default function TambahSiswaPage() {
  const router = useRouter();

  const [isCollapsed, setIsCollapsed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingKelas, setLoadingKelas] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [kelas, setKelas] = useState([]);
  const [kelasError, setKelasError] = useState("");

  const [form, setForm] = useState({
    namaLengkap: "",
    namaPengguna: "",
    kataSandi: "",
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

  /* =========================================================
     AMBIL DATA KELAS
     Sesuaikan endpoint bila route backend berbeda.
  ========================================================= */

  const fetchKelas = async () => {
    setLoadingKelas(true);
    setKelasError("");

    try {
      const response = await apiFetch("/api/kelas", {
        method: "GET",
      });

      const list = getClassList(response);

      const validClasses = list.filter(
        (item) => getClassId(item) && getClassName(item)
      );

      setKelas(validClasses);

      if (validClasses.length === 0) {
        setKelasError(
          "Daftar kelas kosong atau format respons API belum sesuai."
        );
      }
    } catch (err) {
      console.error("Gagal mengambil kelas:", err);

      setKelas([]);
      setKelasError(
        err?.message ||
          "Gagal mengambil daftar kelas. Periksa endpoint API kelas."
      );
    } finally {
      setLoadingKelas(false);
    }
  };

  useEffect(() => {
    fetchKelas();
  }, []);

  /* =========================================================
     HANDLE INPUT
  ========================================================= */

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));

    setError("");
    setSuccess("");
  };

  /* =========================================================
     HANDLE SUBMIT
  ========================================================= */

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (loading) return;

    setError("");
    setSuccess("");

    if (!form.namaLengkap.trim()) {
      setError("Nama lengkap wajib diisi.");
      return;
    }

    if (form.namaLengkap.trim().length < 3) {
      setError("Nama lengkap minimal 3 karakter.");
      return;
    }

    if (!form.namaPengguna.trim()) {
      setError("Username siswa wajib diisi.");
      return;
    }

    if (!form.email.trim()) {
      setError("Email wajib diisi.");
      return;
    }

    if (!form.kataSandi) {
      setError("Password awal wajib diisi.");
      return;
    }

    if (form.kataSandi.length < 8) {
      setError("Password awal minimal 8 karakter.");
      return;
    }

    if (!form.nisn.trim()) {
      setError("NISN wajib diisi.");
      return;
    }

    if (!form.kelasId) {
      setError("Silakan pilih kelas terlebih dahulu.");
      return;
    }

    try {
      setLoading(true);

      /*
       * kelasId ikut dikirim karena service siswa
       * mewajibkan field ini.
       *
       * Controller backend yang sebelumnya ditunjukkan
       * belum menyimpan kelasId maupun data tambahan siswa.
       */

      const payload = {
        namaPengguna: form.namaPengguna.trim(),
        email: form.email.trim(),
        kataSandi: form.kataSandi,
        namaLengkap: form.namaLengkap.trim(),
        nisn: form.nisn.trim(),
        nis: form.nis.trim() || undefined,
        kelasId: form.kelasId,
      };

      console.log("Payload create siswa:", {
        ...payload,
        kataSandi: "[DISEMBUNYIKAN]",
      });

      const response = await createSiswa(payload);

      console.log("Response create siswa:", response);

      setSuccess("Akun siswa berhasil dibuat.");

      setTimeout(() => {
        router.push("/admin/siswa");
      }, 1000);
    } catch (err) {
      console.error("Error create siswa:", err);

      setError(
        err?.message || "Gagal menambahkan akun siswa."
      );
    } finally {
      setLoading(false);
    }
  };

  const sectionClass =
    `overflow-hidden rounded-2xl border ${themeNeutralBorder} theme-card ${themeCardShadow}`;

  const gridClass = "grid gap-5 p-5 md:grid-cols-2";

  return (
    <div className="flex h-screen w-full overflow-hidden theme-page">
      <Sidebar
        active="siswa"
        setActive={() => {}}
        collapsed={isCollapsed}
        setCollapsed={setIsCollapsed}
      />

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <Header
          toggleSidebar={() => setIsCollapsed((prev) => !prev)}
          notifications={[]}
          user={{
            name: "Admin Sekolah",
            email: "admin@smartschool.com",
            avatar: "AD",
          }}
        />

        <main className="min-h-0 flex-1 overflow-y-auto">
          <div className="w-full px-3 py-4 sm:px-4 md:px-6 lg:px-8 xl:px-10">
            <div className="mx-auto w-full max-w-6xl">
              {/* HEADER */}
              <div className="mb-5 flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => router.push("/admin/siswa")}
                  className={`flex h-10 w-10 items-center justify-center rounded-xl border ${themeNeutralBorder} theme-card theme-text-secondary transition ${themeNeutralHover} hover:text-[var(--color-primary)]`}
                  aria-label="Kembali ke data siswa"
                >
                  <ArrowLeft size={19} />
                </button>

                <div
                  className={`flex h-11 w-11 items-center justify-center rounded-xl ${themePrimaryGradient} text-[var(--color-card)] ${themePrimaryShadow}`}
                >
                  <UserPlus size={21} />
                </div>

                <div>
                  <h1 className="text-xl font-semibold theme-text sm:text-2xl">
                    Tambah Siswa
                  </h1>
                  <p className="text-xs theme-text-secondary sm:text-sm">
                    Tambahkan akun siswa baru
                  </p>
                </div>
              </div>

              {/* ERROR */}
              {error && (
                <div
                  role="alert"
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

              {/* SUCCESS */}
              {success && (
                <div
                  role="status"
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

              <form onSubmit={handleSubmit} className="space-y-5">
                {/* DATA UTAMA */}
                <section className={sectionClass}>
                  <SectionHeader
                    icon={<User size={18} />}
                    title="Data Utama"
                    description="Informasi dasar dan akun siswa"
                  />

                  <div className={gridClass}>
                    <InputField
                      label="Nama Lengkap"
                      name="namaLengkap"
                      value={form.namaLengkap}
                      onChange={handleChange}
                      placeholder="Masukkan nama lengkap"
                      required
                      icon={<User size={17} />}
                    />

                    <InputField
                      label="Username"
                      name="namaPengguna"
                      value={form.namaPengguna}
                      onChange={handleChange}
                      placeholder="Buat username siswa"
                      required
                      icon={<User size={17} />}
                    />

                    <InputField
                      label="Email"
                      name="email"
                      type="email"
                      value={form.email}
                      onChange={handleChange}
                      placeholder="contoh@email.com"
                      required
                      icon={<Mail size={17} />}
                    />

                    <InputField
                      label="Password Awal"
                      name="kataSandi"
                      type="password"
                      value={form.kataSandi}
                      onChange={handleChange}
                      placeholder="Minimal 8 karakter"
                      required
                      minLength={8}
                      autoComplete="new-password"
                      icon={<KeyRound size={17} />}
                    />

                    <InputField
                      label="NISN"
                      name="nisn"
                      value={form.nisn}
                      onChange={handleChange}
                      placeholder="Masukkan NISN"
                      required
                      icon={<CreditCard size={17} />}
                    />

                    <InputField
                      label="NIS"
                      name="nis"
                      value={form.nis}
                      onChange={handleChange}
                      placeholder="Masukkan NIS (opsional)"
                      icon={<CreditCard size={17} />}
                    />

                    {/* DROPDOWN KELAS */}
                    <div>
                      <label
                        htmlFor="kelasId"
                        className="mb-1.5 block text-sm font-medium theme-text-secondary"
                      >
                        Kelas
                        <span className="ml-1 theme-danger">*</span>
                      </label>

                      <div className="relative">
                        <Users
                          size={17}
                          className="absolute left-3.5 top-1/2 -translate-y-1/2 theme-text-muted"
                        />

                        <select
                          id="kelasId"
                          name="kelasId"
                          value={form.kelasId}
                          onChange={handleChange}
                          required
                          disabled={loadingKelas || kelas.length === 0}
                          className={`w-full appearance-none rounded-xl theme-input py-2.5 pl-10 pr-10 text-sm theme-text outline-none transition ${themeFocus} disabled:cursor-not-allowed disabled:opacity-60`}
                        >
                          <option value="">
                            {loadingKelas
                              ? "Memuat daftar kelas..."
                              : kelas.length > 0
                                ? "Pilih kelas"
                                : "Kelas belum tersedia"}
                          </option>

                          {kelas.map((item) => (
                            <option
                              key={getClassId(item)}
                              value={getClassId(item)}
                            >
                              {getClassName(item)}
                            </option>
                          ))}
                        </select>

                        {loadingKelas ? (
                          <Loader2
                            size={16}
                            className="absolute right-3.5 top-1/2 -translate-y-1/2 animate-spin theme-text-muted"
                          />
                        ) : (
                          <ChevronDown
                            size={16}
                            className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 theme-text-muted"
                          />
                        )}
                      </div>

                      {kelasError && (
                        <div className="mt-2">
                          <p className="text-xs theme-danger">
                            {kelasError}
                          </p>

                          <button
                            type="button"
                            onClick={fetchKelas}
                            disabled={loadingKelas}
                            className="mt-2 inline-flex items-center gap-1.5 text-xs font-medium text-[var(--color-primary)] hover:underline disabled:opacity-50"
                          >
                            <RefreshCw size={13} />
                            Coba muat ulang kelas
                          </button>
                        </div>
                      )}

                      {!kelasError && !loadingKelas && kelas.length > 0 && (
                        <p className="mt-1.5 text-xs theme-text-muted">
                          Pilih kelas tempat siswa akan terdaftar.
                        </p>
                      )}
                    </div>

                    <InputField
                      label="NIK"
                      name="nik"
                      value={form.nik}
                      onChange={handleChange}
                      placeholder="Masukkan NIK (opsional)"
                      icon={<CreditCard size={17} />}
                    />
                  </div>
                </section>

                {/* DATA AYAH */}
                <section className={sectionClass}>
                  <SectionHeader
                    icon={<Users size={18} />}
                    title="Data Ayah"
                    description="Informasi orang tua siswa"
                    iconClass={themeInfoSurface}
                  />

                  <div className={gridClass}>
                    <InputField
                      label="Nama Ayah"
                      name="namaAyah"
                      value={form.namaAyah}
                      onChange={handleChange}
                      placeholder="Masukkan nama ayah"
                      icon={<User size={17} />}
                    />

                    <InputField
                      label="Pekerjaan Ayah"
                      name="pekerjaanAyah"
                      value={form.pekerjaanAyah}
                      onChange={handleChange}
                      placeholder="Masukkan pekerjaan ayah"
                      icon={<BriefcaseBusiness size={17} />}
                    />
                  </div>
                </section>

                {/* DATA IBU */}
                <section className={sectionClass}>
                  <SectionHeader
                    icon={<Users size={18} />}
                    title="Data Ibu"
                    description="Informasi orang tua siswa"
                    iconClass={themeInfoSurface}
                  />

                  <div className={gridClass}>
                    <InputField
                      label="Nama Ibu"
                      name="namaIbu"
                      value={form.namaIbu}
                      onChange={handleChange}
                      placeholder="Masukkan nama ibu"
                      icon={<User size={17} />}
                    />

                    <InputField
                      label="Pekerjaan Ibu"
                      name="pekerjaanIbu"
                      value={form.pekerjaanIbu}
                      onChange={handleChange}
                      placeholder="Masukkan pekerjaan ibu"
                      icon={<BriefcaseBusiness size={17} />}
                    />
                  </div>
                </section>

                {/* ALAMAT */}
                <section className={sectionClass}>
                  <SectionHeader
                    icon={<MapPin size={18} />}
                    title="Alamat"
                    description="Informasi tempat tinggal siswa"
                    iconClass={themeSuccessSurface}
                  />

                  <div className={gridClass}>
                    <TextareaField
                      label="Alamat KTP"
                      name="alamatKtp"
                      value={form.alamatKtp}
                      onChange={handleChange}
                      placeholder="Masukkan alamat sesuai KTP"
                    />

                    <TextareaField
                      label="Alamat Domisili"
                      name="alamatDomisili"
                      value={form.alamatDomisili}
                      onChange={handleChange}
                      placeholder="Masukkan alamat domisili"
                    />

                    <InputField
                      label="Kecamatan"
                      name="kecamatan"
                      value={form.kecamatan}
                      onChange={handleChange}
                      placeholder="Masukkan kecamatan"
                    />

                    <InputField
                      label="Kelurahan"
                      name="kelurahan"
                      value={form.kelurahan}
                      onChange={handleChange}
                      placeholder="Masukkan kelurahan"
                    />

                    <InputField
                      label="Kota"
                      name="kota"
                      value={form.kota}
                      onChange={handleChange}
                      placeholder="Masukkan kota"
                    />
                  </div>
                </section>

                {/* INFO */}
                <div
                  className={`flex items-start gap-3 rounded-xl border ${themeInfoBorder} ${themeInfoSurface} p-4`}
                >
                  <AlertCircle
                    size={19}
                    className="mt-0.5 shrink-0 text-[var(--color-info)]"
                  />

                  <div>
                    <p className="text-sm font-semibold theme-text">
                      Informasi penyimpanan
                    </p>

                    <p className="mt-1 text-xs leading-relaxed theme-text-secondary">
                      Akun dibuat menggunakan username, email,
                      password, nama lengkap, NISN, NIS, dan ID kelas
                      yang dipilih. Pastikan endpoint backend mendukung
                      penyimpanan relasi kelas dan data tambahan siswa.
                    </p>
                  </div>
                </div>

                {/* ACTION */}
                <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                  <button
                    type="button"
                    onClick={() => router.push("/admin/siswa")}
                    disabled={loading}
                    className={`rounded-xl border ${themeNeutralBorder} theme-card px-5 py-2.5 text-sm font-medium theme-text-secondary transition ${themeNeutralHover} disabled:cursor-not-allowed disabled:opacity-50`}
                  >
                    Batal
                  </button>

                  <button
                    type="submit"
                    disabled={loading || loadingKelas || kelas.length === 0}
                    className={`flex items-center justify-center gap-2 rounded-xl ${themePrimaryGradient} px-6 py-2.5 text-sm font-medium text-[var(--color-card)] ${themeSmallShadow} transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60`}
                  >
                    {loading ? (
                      <>
                        <Loader2 size={17} className="animate-spin" />
                        Menyimpan...
                      </>
                    ) : (
                      <>
                        <Save size={17} />
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
   SECTION HEADER
========================================================= */

function SectionHeader({
  icon,
  title,
  description,
  iconClass = themePrimarySurface,
}) {
  return (
    <div
      className={`border-b ${themeDivider} ${themeNeutralSurface} px-5 py-4`}
    >
      <div className="flex items-center gap-3">
        <div
          className={`flex h-9 w-9 items-center justify-center rounded-lg ${iconClass} text-[var(--color-primary)]`}
        >
          {icon}
        </div>

        <div>
          <h2 className="font-semibold theme-text">{title}</h2>
          <p className="text-xs theme-text-muted">{description}</p>
        </div>
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
  minLength,
  autoComplete,
}) {
  return (
    <div>
      <label
        htmlFor={name}
        className="mb-1.5 block text-sm font-medium theme-text-secondary"
      >
        {label}
        {required && <span className="ml-1 theme-danger">*</span>}
      </label>

      <div className="relative">
        {icon && (
          <div className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 theme-text-muted">
            {icon}
          </div>
        )}

        <input
          id={name}
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          minLength={minLength}
          autoComplete={autoComplete}
          className={`w-full rounded-xl theme-input py-2.5 ${
            icon ? "pl-10" : "pl-4"
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
      <label
        htmlFor={name}
        className="mb-1.5 block text-sm font-medium theme-text-secondary"
      >
        {label}
        {required && <span className="ml-1 theme-danger">*</span>}
      </label>

      <textarea
        id={name}
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