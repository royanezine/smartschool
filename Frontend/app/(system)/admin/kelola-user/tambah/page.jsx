
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import Header from "../../../../components/Header";
import Sidebar from "../../../../components/Sidebar";

import {
  ArrowLeft,
  Save,
  X,
  CheckCircle,
  AlertCircle,
  Info,
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Shield,
  Hash,
  UserPlus,
  UserCog,
  Loader2,
} from "lucide-react";

const dummyRoles = [
  {
    id: 1,
    nama: "kepala_sekolah",
    namaTampilan: "Kepala Sekolah",
    deskripsi: "Memimpin sekolah",
  },
  {
    id: 2,
    nama: "wakil_kepala",
    namaTampilan: "Wakil Kepala Sekolah",
    deskripsi: "Membantu Kepala Sekolah",
  },
  {
    id: 3,
    nama: "kepala_jurusan",
    namaTampilan: "Kepala Jurusan",
    deskripsi: "Mengelola jurusan",
  },
  {
    id: 4,
    nama: "guru_bk",
    namaTampilan: "Guru BK",
    deskripsi: "Bimbingan Konseling",
  },
  {
    id: 5,
    nama: "bendahara",
    namaTampilan: "Bendahara",
    deskripsi: "Mengelola keuangan",
  },
  {
    id: 6,
    nama: "guru",
    namaTampilan: "Guru",
    deskripsi: "Tenaga pendidik",
  },
  {
    id: 7,
    nama: "wali_kelas",
    namaTampilan: "Wali Kelas",
    deskripsi: "Mengelola kelas",
  },
  {
    id: 8,
    nama: "koordinator_bk",
    namaTampilan: "Koordinator BK",
    deskripsi: "Koordinator BK",
  },
];

export default function TambahUserPage() {
  const router = useRouter();

  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isLoadingRoles, setIsLoadingRoles] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [roles, setRoles] = useState([]);

  const [formData, setFormData] = useState({
    namaLengkap: "",
    email: "",
    noTelepon: "",
    peranId: "",
    nip: "",
    jenisKelamin: "",
    tanggalLahir: "",
    alamat: "",
    status: "aktif",
    namaPengguna: "",
    kataSandi: "",
  });

  useEffect(() => {
    loadRoles();
  }, []);

  const loadRoles = async () => {
    try {
      setIsLoadingRoles(true);
      setServerError("");

      await new Promise((resolve) => setTimeout(resolve, 400));

      setRoles(dummyRoles);
    } catch (error) {
      console.error("LOAD ROLE ERROR:", error);
      setServerError("Gagal memuat data role.");
    } finally {
      setIsLoadingRoles(false);
    }
  };

  const handleChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: "",
      }));
    }

    setServerError("");
  };

  const generateUsername = () => {
    if (!formData.email) return;

    const username = formData.email
      .split("@")[0]
      .toLowerCase()
      .replace(/[^a-z0-9._-]/g, "");

    handleChange("namaPengguna", username);
  };

  const generatePassword = () => {
    const random = Math.random().toString(36).slice(-8);

    handleChange("kataSandi", `Smart@${random}`);
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.namaLengkap.trim()) {
      newErrors.namaLengkap = "Nama lengkap wajib diisi";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email wajib diisi";
    }

    if (!formData.noTelepon.trim()) {
      newErrors.noTelepon = "Nomor telepon wajib diisi";
    }

    if (!formData.peranId) {
      newErrors.peranId = "Role wajib dipilih";
    }

    if (!formData.nip.trim()) {
      newErrors.nip = "NIP wajib diisi";
    }

    if (!formData.jenisKelamin) {
      newErrors.jenisKelamin = "Jenis kelamin wajib dipilih";
    }

    if (!formData.tanggalLahir) {
      newErrors.tanggalLahir = "Tanggal lahir wajib diisi";
    }

    if (!formData.alamat.trim()) {
      newErrors.alamat = "Alamat wajib diisi";
    }

    if (!formData.namaPengguna.trim()) {
      newErrors.namaPengguna = "Username wajib diisi";
    }

    if (!formData.kataSandi.trim()) {
      newErrors.kataSandi = "Password wajib diisi";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setServerError("");

    if (!validate()) return;

    try {
      setIsSaving(true);

      await new Promise((resolve) => setTimeout(resolve, 1000));

      const payload = {
        namaPengguna: formData.namaPengguna.trim(),
        email: formData.email.trim(),
        kataSandi: formData.kataSandi,
        namaLengkap: formData.namaLengkap.trim(),
        peranId: formData.peranId,
        nip: formData.nip.trim(),
        jenisKelamin: formData.jenisKelamin,
        tanggalLahir: formData.tanggalLahir,
        alamat: formData.alamat.trim(),
        noTelepon: formData.noTelepon.trim(),
        status: formData.status,
      };

      console.log("DUMMY PAYLOAD:", payload);

      setSaved(true);

      setTimeout(() => {
        router.push("/admin/kelola-user");
        router.refresh();
      }, 1200);
    } catch (error) {
      console.error("CREATE USER ERROR:", error);
      setServerError("Gagal menyimpan user.");
    } finally {
      setIsSaving(false);
    }
  };

  const selectedRole = roles.find(
    (role) => String(role.id) === String(formData.peranId)
  );

  return (
    <div className="theme-page flex h-screen w-full overflow-hidden">
      {/* SIDEBAR */}
      <Sidebar
        active="kelolaUser"
        setActive={() => {}}
        collapsed={isCollapsed}
        setCollapsed={setIsCollapsed}
      />

      {/* CONTENT AREA */}
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

        {/* MAIN SCROLL */}
        <main className="min-w-0 flex-1 overflow-y-auto overflow-x-hidden">
          <div className="w-full px-3 py-4 sm:px-5 sm:py-6 lg:px-6 xl:px-8">
            <div className="mx-auto w-full max-w-5xl space-y-5">

              {/* BACK */}
              <button
                type="button"
                onClick={() => router.push("/admin/kelola-user")}
                className="group inline-flex max-w-full items-center gap-2 text-sm font-medium text-[var(--color-text-secondary)] transition hover:text-[var(--color-primary)]"
              >
                <ArrowLeft
                  size={18}
                  className="shrink-0 transition-transform group-hover:-translate-x-1"
                />

                <span className="truncate">
                  Kembali ke Daftar User
                </span>
              </button>

              {/* HEADER */}
              <section className="theme-card relative overflow-hidden rounded-2xl border shadow-sm">
                <div
                  className="pointer-events-none absolute -right-20 -top-24 h-64 w-64 rounded-full blur-3xl"
                  style={{
                    background:
                      "color-mix(in srgb, var(--color-primary) 10%, transparent)",
                  }}
                />

                <div className="relative flex min-w-0 flex-col gap-5 p-4 sm:p-5 lg:flex-row lg:items-center lg:justify-between lg:p-6">

                  {/* TITLE */}
                  <div className="flex min-w-0 items-start gap-3 sm:gap-4">
                    <div
                      className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-white shadow-lg sm:h-14 sm:w-14"
                      style={{
                        backgroundImage:
                          "var(--color-brand-logo-bg)",
                      }}
                    >
                      <UserPlus size={23} />
                    </div>

                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h1 className="theme-text text-xl font-bold tracking-tight sm:text-2xl">
                          Tambah User
                        </h1>

                        <span className="theme-info rounded-full px-2.5 py-1 text-[11px] font-semibold">
                          Level Sekolah
                        </span>
                      </div>

                      <div className="mt-1.5 flex min-w-0 items-start gap-2">
                        <UserCog
                          size={15}
                          className="mt-0.5 shrink-0 text-[var(--color-primary)]"
                        />

                        <p className="theme-text-muted text-sm leading-relaxed">
                          Tambahkan user baru ke lingkungan sekolah.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* HEADER BUTTON */}
                  <div className="flex w-full flex-col gap-2 sm:flex-row lg:w-auto">
                    <button
                      type="button"
                      onClick={() => router.push("/admin/kelola-user")}
                      className="theme-input inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-xl px-4 text-sm font-medium transition sm:flex-none sm:px-5"
                    >
                      <X size={17} />
                      Batal
                    </button>

                    <button
                      type="submit"
                      form="user-form"
                      disabled={isSaving || isLoadingRoles}
                      className="theme-primary inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-xl px-4 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 sm:flex-none sm:px-5"
                    >
                      {isSaving ? (
                        <Loader2 size={17} className="animate-spin" />
                      ) : (
                        <Save size={17} />
                      )}

                      <span>
                        {isSaving ? "Menyimpan..." : "Simpan User"}
                      </span>
                    </button>
                  </div>
                </div>
              </section>

              {/* SUCCESS */}
              {saved && (
                <div className="theme-success flex items-start gap-3 rounded-2xl border p-4 text-sm">
                  <CheckCircle
                    size={19}
                    className="mt-0.5 shrink-0"
                  />

                  <span className="leading-relaxed">
                    User berhasil ditambahkan! Mengalihkan ke daftar user...
                  </span>
                </div>
              )}

              {/* ERROR */}
              {serverError && (
                <div className="theme-danger flex items-start gap-3 rounded-2xl border p-4 text-sm">
                  <AlertCircle
                    size={19}
                    className="mt-0.5 shrink-0"
                  />

                  <div className="min-w-0">
                    <p className="font-semibold">
                      Gagal menyimpan user
                    </p>

                    <p className="mt-1 leading-relaxed">
                      {serverError}
                    </p>
                  </div>
                </div>
              )}

              {/* FORM CARD */}
              <section className="theme-card rounded-2xl border p-4 shadow-sm sm:p-5 lg:p-6">

                {/* FORM TITLE */}
                <div className="mb-6 flex items-center gap-3 border-b pb-4 theme-border-soft">
                  <div className="theme-info flex h-9 w-9 shrink-0 items-center justify-center rounded-xl">
                    <Info size={17} />
                  </div>

                  <div className="min-w-0">
                    <p className="theme-text text-sm font-bold">
                      Informasi User
                    </p>

                    <p className="theme-text-muted mt-0.5 text-xs leading-relaxed">
                      Masukkan data user secara lengkap
                    </p>
                  </div>
                </div>

                <form
                  id="user-form"
                  onSubmit={handleSubmit}
                  className="space-y-6"
                >
                  {/* DATA UTAMA */}
                  <div className="grid min-w-0 grid-cols-1 gap-x-5 gap-y-5 md:grid-cols-2">

                    {/* NAMA */}
                    <div className="min-w-0 md:col-span-2">
                      <label className="theme-text-secondary mb-1.5 block text-sm font-semibold">
                        Nama Lengkap{" "}
                        <span className="text-[var(--color-danger)]">*</span>
                      </label>

                      <div className="relative">
                        <User
                          size={17}
                          className="theme-text-placeholder pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2"
                        />

                        <input
                          type="text"
                          value={formData.namaLengkap}
                          onChange={(e) =>
                            handleChange(
                              "namaLengkap",
                              e.target.value
                            )
                          }
                          placeholder="Contoh: Ahmad Fauzi, M.Pd."
                          className={inputClass(errors.namaLengkap)}
                        />
                      </div>

                      {errors.namaLengkap && (
                        <ErrorText>
                          {errors.namaLengkap}
                        </ErrorText>
                      )}
                    </div>

                    {/* EMAIL */}
                    <Field
                      label="Email"
                      required
                      icon={<Mail size={17} />}
                      error={errors.email}
                    >
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) =>
                          handleChange("email", e.target.value)
                        }
                        placeholder="user@sekolah.sch.id"
                        className={inputClass(errors.email)}
                      />
                    </Field>

                    {/* PHONE */}
                    <Field
                      label="Nomor Telepon"
                      required
                      icon={<Phone size={17} />}
                      error={errors.noTelepon}
                    >
                      <input
                        type="text"
                        value={formData.noTelepon}
                        onChange={(e) =>
                          handleChange(
                            "noTelepon",
                            e.target.value
                          )
                        }
                        placeholder="081234567890"
                        className={inputClass(errors.noTelepon)}
                      />
                    </Field>

                    {/* USERNAME */}
                    <Field
                      label="Username"
                      required
                      icon={<User size={17} />}
                      error={errors.namaPengguna}
                    >
                      <div className="flex min-w-0 flex-col gap-2 sm:flex-row">
                        <input
                          type="text"
                          value={formData.namaPengguna}
                          onChange={(e) =>
                            handleChange(
                              "namaPengguna",
                              e.target.value
                            )
                          }
                          placeholder="username"
                          className={`${inputClass(
                            errors.namaPengguna
                          )} min-w-0 flex-1`}
                        />

                        <button
                          type="button"
                          onClick={generateUsername}
                          className="theme-info h-11 shrink-0 rounded-xl border px-4 text-xs font-bold transition hover:bg-[var(--color-info-background)]"
                        >
                          Generate
                        </button>
                      </div>
                    </Field>

                    {/* PASSWORD */}
                    <Field
                      label="Password"
                      required
                      icon={<Shield size={17} />}
                      error={errors.kataSandi}
                    >
                      <div className="flex min-w-0 flex-col gap-2 sm:flex-row">
                        <input
                          type="text"
                          value={formData.kataSandi}
                          onChange={(e) =>
                            handleChange(
                              "kataSandi",
                              e.target.value
                            )
                          }
                          placeholder="Password awal"
                          className={`${inputClass(
                            errors.kataSandi
                          )} min-w-0 flex-1`}
                        />

                        <button
                          type="button"
                          onClick={generatePassword}
                          className="theme-info h-11 shrink-0 rounded-xl border px-4 text-xs font-bold transition hover:bg-[var(--color-info-background)]"
                        >
                          Generate
                        </button>
                      </div>
                    </Field>

                    {/* NIP */}
                    <Field
                      label="NIP"
                      required
                      icon={<Hash size={17} />}
                      error={errors.nip}
                    >
                      <input
                        type="text"
                        value={formData.nip}
                        onChange={(e) =>
                          handleChange("nip", e.target.value)
                        }
                        placeholder="198501012010011001"
                        className={inputClass(errors.nip)}
                      />
                    </Field>

                    {/* ROLE */}
                    <div className="min-w-0">
                      <label className="theme-text-secondary mb-1.5 block text-sm font-semibold">
                        Role{" "}
                        <span className="text-[var(--color-danger)]">*</span>
                      </label>

                      <div className="relative">
                        <Shield
                          size={17}
                          className="theme-text-placeholder pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2"
                        />

                        <select
                          value={formData.peranId}
                          onChange={(e) =>
                            handleChange(
                              "peranId",
                              e.target.value
                            )
                          }
                          disabled={isLoadingRoles}
                          className={`${inputClass(
                            errors.peranId
                          )} appearance-none pr-10`}
                        >
                          <option value="">
                            {isLoadingRoles
                              ? "Memuat role..."
                              : "Pilih Role"}
                          </option>

                          {roles.map((role) => (
                            <option
                              key={role.id}
                              value={role.id}
                            >
                              {role.namaTampilan || role.nama}
                            </option>
                          ))}
                        </select>
                      </div>

                      {errors.peranId && (
                        <ErrorText>
                          {errors.peranId}
                        </ErrorText>
                      )}
                    </div>

                    {/* JENIS KELAMIN */}
                    <div className="min-w-0">
                      <label className="theme-text-secondary mb-1.5 block text-sm font-semibold">
                        Jenis Kelamin{" "}
                        <span className="text-[var(--color-danger)]">*</span>
                      </label>

                      <div className="grid grid-cols-2 gap-2">
                        {["Laki-laki", "Perempuan"].map(
                          (gender) => (
                            <button
                              key={gender}
                              type="button"
                              onClick={() =>
                                handleChange(
                                  "jenisKelamin",
                                  gender
                                )
                              }
                              className={`min-h-11 rounded-xl border px-3 py-2.5 text-sm font-semibold transition ${
                                formData.jenisKelamin === gender
                                  ? "border-[var(--color-primary)] bg-[var(--color-info-background)] text-[var(--color-primary)] ring-2 ring-[var(--color-primary)]/20"
                                  : "theme-input"
                              }`}
                            >
                              {gender}
                            </button>
                          )
                        )}
                      </div>

                      {errors.jenisKelamin && (
                        <ErrorText>
                          {errors.jenisKelamin}
                        </ErrorText>
                      )}
                    </div>

                    {/* TANGGAL LAHIR */}
                    <Field
                      label="Tanggal Lahir"
                      required
                      icon={<Calendar size={17} />}
                      error={errors.tanggalLahir}
                    >
                      <input
                        type="date"
                        value={formData.tanggalLahir}
                        onChange={(e) =>
                          handleChange(
                            "tanggalLahir",
                            e.target.value
                          )
                        }
                        className={inputClass(
                          errors.tanggalLahir
                        )}
                      />
                    </Field>

                    {/* STATUS */}
                    <div className="min-w-0">
                      <label className="theme-text-secondary mb-1.5 block text-sm font-semibold">
                        Status
                      </label>

                      <div className="grid grid-cols-2 gap-2">
                        {["aktif", "nonaktif"].map(
                          (status) => (
                            <button
                              key={status}
                              type="button"
                              onClick={() =>
                                handleChange(
                                  "status",
                                  status
                                )
                              }
                              className={`min-h-11 rounded-xl border px-3 py-2.5 text-sm font-semibold transition ${
                                formData.status === status
                                  ? status === "aktif"
                                    ? "theme-success"
                                    : "theme-danger"
                                  : "theme-input"
                              }`}
                            >
                              {status === "aktif"
                                ? "Aktif"
                                : "Nonaktif"}
                            </button>
                          )
                        )}
                      </div>
                    </div>

                    {/* ALAMAT */}
                    <div className="min-w-0 md:col-span-2">
                      <label className="theme-text-secondary mb-1.5 block text-sm font-semibold">
                        Alamat{" "}
                        <span className="text-[var(--color-danger)]">*</span>
                      </label>

                      <div className="relative">
                        <MapPin
                          size={17}
                          className="theme-text-placeholder pointer-events-none absolute left-3.5 top-3.5"
                        />

                        <textarea
                          rows={4}
                          value={formData.alamat}
                          onChange={(e) =>
                            handleChange(
                              "alamat",
                              e.target.value
                            )
                          }
                          placeholder="Alamat lengkap user"
                          className={`${inputClass(
                            errors.alamat
                          )} resize-none`}
                        />
                      </div>

                      {errors.alamat && (
                        <ErrorText>
                          {errors.alamat}
                        </ErrorText>
                      )}
                    </div>
                  </div>

                  {/* SELECTED ROLE */}
                  {selectedRole && (
                    <div className="theme-info rounded-2xl border p-4">
                      <div className="flex items-start gap-3">
                        <div className="theme-card flex h-10 w-10 shrink-0 items-center justify-center rounded-xl">
                          <Shield size={18} />
                        </div>

                        <div className="min-w-0">
                          <p className="text-sm font-bold">
                            Role Dipilih
                          </p>

                          <p className="mt-1 text-sm font-semibold">
                            {selectedRole.namaTampilan ||
                              selectedRole.nama}
                          </p>

                          {selectedRole.deskripsi && (
                            <p className="mt-1 text-xs leading-relaxed">
                              {selectedRole.deskripsi}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* INFO */}
                  <div className="theme-info flex items-start gap-3 rounded-2xl border p-4">
                    <Info
                      size={17}
                      className="mt-0.5 shrink-0"
                    />

                    <div className="min-w-0">
                      <p className="text-sm font-bold">
                        Informasi
                      </p>

                      <p className="mt-1 text-xs leading-relaxed sm:text-sm">
                        Role yang tersedia diambil langsung
                        dari database. Sistem akan menyimpan
                        ID role pada field{" "}
                        <b>peranId</b>.
                      </p>
                    </div>
                  </div>

                  {/* ACTION */}
                  <div className="theme-border-soft flex flex-col-reverse gap-3 border-t pt-5 sm:flex-row sm:justify-end">
                    <button
                      type="button"
                      onClick={() =>
                        router.push("/admin/kelola-user")
                      }
                      className="theme-input h-11 w-full rounded-xl px-6 text-sm font-semibold transition sm:w-auto"
                    >
                      Batal
                    </button>

                    <button
                      type="submit"
                      disabled={
                        isSaving || isLoadingRoles
                      }
                      className="theme-primary inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl px-6 text-sm font-bold transition disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
                    >
                      {isSaving ? (
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
                          Simpan User
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </section>

              {/* FOOTER */}
              <footer className="theme-border border-t py-5 text-center">
                <p className="theme-text-muted text-xs">
                  © 2026 SmartSchool • Tambah User - Level Sekolah
                </p>
              </footer>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

/* =====================================================
   FIELD
===================================================== */

function Field({
  label,
  required,
  icon,
  error,
  children,
}) {
  return (
    <div className="min-w-0">
      <label className="theme-text-secondary mb-1.5 block text-sm font-semibold">
        {label}{" "}
        {required && (
          <span className="text-[var(--color-danger)]">*</span>
        )}
      </label>

      <div className="relative min-w-0">
        <div className="theme-text-placeholder pointer-events-none absolute left-3.5 top-1/2 z-10 -translate-y-1/2">
          {icon}
        </div>

        <div className="min-w-0">
          {children}
        </div>
      </div>

      {error && <ErrorText>{error}</ErrorText>}
    </div>
  );
}

/* =====================================================
   INPUT CLASS
===================================================== */

function inputClass(error) {
  return `theme-input h-11 w-full min-w-0 rounded-xl border py-2.5 pl-10 pr-4 text-sm font-medium outline-none transition focus:border-[var(--color-primary)] focus:ring-4 focus:ring-[var(--color-primary)]/10 ${
    error
      ? "border-[var(--color-danger)]"
      : "theme-border"
  }`;
}

/* =====================================================
   ERROR
===================================================== */

function ErrorText({ children }) {
  return (
    <p className="theme-text-danger mt-1.5 flex items-start gap-1 text-xs font-medium leading-relaxed">
      <AlertCircle
        size={12}
        className="mt-0.5 shrink-0 text-[var(--color-danger)]"
      />

      <span className="text-[var(--color-danger)]">
        {children}
      </span>
    </p>
  );
}

