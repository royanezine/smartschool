"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import Header from "@/app/components/Header";
import Sidebar from "@/app/components/Sidebar";
import { createUser } from "@/services/user.service";
import { getRoles } from "@/services/role.service";

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
  Clock,
} from "lucide-react";



function normalizeRole(value = "") {
  return String(value)
    .trim()
    .toLowerCase()
    .replace(/[\s-]+/g, "_");
}

function extractRoles(response) {
  const candidates = [
    response?.data?.roles,
    response?.data?.data,
    response?.data?.items,
    response?.data,
    response?.roles,
    response?.items,
  ];

  return candidates.find(Array.isArray) || [];
}

function inputClass(error) {
  return `theme-input h-11 w-full min-w-0 rounded-xl border py-2.5 pl-10 pr-4 text-sm font-medium outline-none transition focus:border-[var(--color-primary)] focus:ring-4 focus:ring-[var(--color-primary)]/10 ${
    error ? "border-[var(--color-danger)]" : "theme-border"
  }`;
}

function ErrorText({ children }) {
  return (
    <p className="theme-text-danger mt-1.5 flex items-start gap-1 text-xs font-medium leading-relaxed">
      <AlertCircle size={12} className="mt-0.5 shrink-0" />
      <span>{children}</span>
    </p>
  );
}

function Field({ label, required, icon, error, children }) {
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
        {children}
      </div>

      {error && <ErrorText>{error}</ErrorText>}
    </div>
  );
}

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
    namaPengguna: "",
    kataSandi: "",
    shiftKerja: "",
  });

  useEffect(() => {
    loadRoles();
  }, []);

  async function loadRoles() {
    try {
      setIsLoadingRoles(true);
      setServerError("");

      const response = await getRoles();
      const roleList = Array.isArray(response) ? response : extractRoles(response);

      if (!roleList.length) {
        setRoles([]);
        throw new Error(
          "Daftar role kosong atau format respons endpoint /api/role berbeda dari yang diharapkan."
        );
      }

      setRoles(roleList.filter((role) => role?.id && role?.nama));
    } catch (error) {
      console.error("LOAD ROLE ERROR:", error);
      setServerError(error.message || "Gagal memuat role dari backend.");
    } finally {
      setIsLoadingRoles(false);
    }
  }

  function handleChange(field, value) {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
      ...(field === "peranId" ? { shiftKerja: "" } : {}),
    }));

    setErrors((prev) => ({
      ...prev,
      [field]: "",
      ...(field === "peranId" ? { shiftKerja: "" } : {}),
    }));

    setServerError("");
  }

  const selectedRole = roles.find(
    (role) => String(role.id) === String(formData.peranId)
  );

  const selectedRoleName = normalizeRole(selectedRole?.nama);
  const isGuru = selectedRoleName === "guru";

  function generateUsername() {
    if (!formData.email.trim()) {
      setServerError("Isi email terlebih dahulu untuk membuat username.");
      return;
    }

    const username = formData.email
      .split("@")[0]
      .toLowerCase()
      .replace(/[^a-z0-9._-]/g, "");

    handleChange("namaPengguna", username);
  }

  function generatePassword() {
    const random = Math.random().toString(36).slice(-8);
    handleChange("kataSandi", `Smart@${random}`);
  }

  function validate() {
    const nextErrors = {};

    if (!formData.namaLengkap.trim()) {
      nextErrors.namaLengkap = "Nama lengkap wajib diisi.";
    }

    if (!formData.email.trim()) {
      nextErrors.email = "Email wajib diisi.";
    } else if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())
    ) {
      nextErrors.email = "Format email tidak valid.";
    }

    if (!formData.noTelepon.trim()) {
      nextErrors.noTelepon = "Nomor telepon wajib diisi.";
    }

    if (!formData.peranId) {
      nextErrors.peranId = "Role wajib dipilih.";
    }

    if (!formData.namaPengguna.trim()) {
      nextErrors.namaPengguna = "Username wajib diisi.";
    }

    if (!formData.kataSandi.trim()) {
      nextErrors.kataSandi = "Password wajib diisi.";
    } else if (formData.kataSandi.length < 8) {
      nextErrors.kataSandi = "Password minimal 8 karakter.";
    }

    if (isGuru && !formData.shiftKerja) {
      nextErrors.shiftKerja = "Shift kerja guru wajib dipilih.";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

 
async function handleSubmit(event) {
  event.preventDefault();

  setServerError("");
  setSaved(false);

  if (!validate()) {
    setServerError("Periksa kembali data yang wajib diisi.");
    return;
  }

  try {
    setIsSaving(true);

    const payload = {
      namaPengguna: formData.namaPengguna.trim(),
      email: formData.email.trim(),
      kataSandi: formData.kataSandi,
      namaLengkap: formData.namaLengkap.trim(),
      peranId: formData.peranId,
      noTelepon: formData.noTelepon.trim() || null,
      nip: formData.nip.trim() || null,
      jenisKelamin:
        formData.jenisKelamin === "Laki-laki"
          ? "L"
          : formData.jenisKelamin === "Perempuan"
            ? "P"
            : null,
      tanggalLahir: formData.tanggalLahir || null,
      alamat: formData.alamat.trim() || null,
      ...(isGuru
        ? { shiftKerja: formData.shiftKerja }
        : {}),
    };

    console.log("PAYLOAD CREATE USER:", payload);

    const result = await createUser(payload);

    console.log("HASIL CREATE USER:", result);

    if (!result || result.success !== true) {
      throw new Error(
        result?.message || "Backend gagal menyimpan pengguna."
      );
    }

    setSaved(true);

    router.replace("/admin/pengguna/kelola-user");
    router.refresh();
  } catch (error) {
    console.error("CREATE USER ERROR:", error);

    setServerError(
      error instanceof Error
        ? error.message
        : "Gagal menyimpan pengguna. Silakan coba lagi."
    );
  } finally {
    setIsSaving(false);
  }
}

  return (
    <div className="theme-page flex h-screen w-full overflow-hidden">
      <Sidebar
        active="kelolaUser"
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

        <main className="min-w-0 flex-1 overflow-y-auto overflow-x-hidden">
          <div className="w-full px-3 py-4 sm:px-5 sm:py-6 lg:px-6 xl:px-8">
            <div className="mx-auto w-full max-w-5xl space-y-5">
              <button
                type="button"
                onClick={() => router.push("/admin/pengguna/kelola-user")}
                className="group inline-flex items-center gap-2 text-sm font-medium text-[var(--color-text-secondary)] transition hover:text-[var(--color-primary)]"
              >
                <ArrowLeft
                  size={18}
                  className="transition-transform group-hover:-translate-x-1"
                />
                Kembali ke Daftar User
              </button>

              <section className="theme-card relative overflow-hidden rounded-2xl border shadow-sm">
                <div
                  className="pointer-events-none absolute -right-20 -top-24 h-64 w-64 rounded-full blur-3xl"
                  style={{
                    background:
                      "color-mix(in srgb, var(--color-primary) 10%, transparent)",
                  }}
                />

                <div className="relative flex min-w-0 flex-col gap-5 p-4 sm:p-5 lg:flex-row lg:items-center lg:justify-between lg:p-6">
                  <div className="flex min-w-0 items-start gap-3 sm:gap-4">
                    <div
                      className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-white shadow-lg sm:h-14 sm:w-14"
                      style={{ backgroundImage: "var(--color-brand-logo-bg)" }}
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

                      <div className="mt-1.5 flex items-start gap-2">
                        <UserCog
                          size={15}
                          className="mt-0.5 shrink-0 text-[var(--color-primary)]"
                        />
                        <p className="theme-text-muted text-sm leading-relaxed">
                          Tambahkan pengguna baru ke lingkungan sekolah.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex w-full flex-col gap-2 sm:flex-row lg:w-auto">
                    <button
                      type="button"
                      onClick={() =>
                        router.push("/admin/pengguna/kelola-user")
                      }
                      className="theme-input inline-flex h-11 items-center justify-center gap-2 rounded-xl px-4 text-sm font-medium transition sm:px-5"
                    >
                      <X size={17} />
                      Batal
                    </button>

                    <button
                      type="submit"
                      form="user-form"
                      disabled={isSaving || isLoadingRoles}
                      className="theme-primary inline-flex h-11 items-center justify-center gap-2 rounded-xl px-4 text-sm font-semibold transition disabled:opacity-50 sm:px-5"
                    >
                      {isSaving ? (
                        <Loader2 size={17} className="animate-spin" />
                      ) : (
                        <Save size={17} />
                      )}
                      {isSaving ? "Menyimpan..." : "Simpan User"}
                    </button>
                  </div>
                </div>
              </section>

              {saved && (
                <div className="theme-success flex items-start gap-3 rounded-2xl border p-4 text-sm">
                  <CheckCircle size={19} className="mt-0.5 shrink-0" />
                  <span>User berhasil dibuat.</span>
                </div>
              )}

              {serverError && (
                <div className="theme-danger flex items-start gap-3 rounded-2xl border p-4 text-sm">
                  <AlertCircle size={19} className="mt-0.5 shrink-0" />
                  <div className="min-w-0">
                    <p className="font-semibold">Terjadi kesalahan</p>
                    <p className="mt-1 break-words leading-relaxed">
                      {serverError}
                    </p>
                    {!isLoadingRoles && roles.length === 0 && (
                      <button
                        type="button"
                        onClick={loadRoles}
                        className="mt-3 font-semibold underline"
                      >
                        Coba muat ulang role
                      </button>
                    )}
                  </div>
                </div>
              )}

              <section className="theme-card rounded-2xl border p-4 shadow-sm sm:p-5 lg:p-6">
                <div className="theme-border-soft mb-6 flex items-center gap-3 border-b pb-4">
                  <div className="theme-info flex h-9 w-9 items-center justify-center rounded-xl">
                    <Info size={17} />
                  </div>
                  <div>
                    <p className="theme-text text-sm font-bold">
                      Informasi User
                    </p>
                    <p className="theme-text-muted mt-0.5 text-xs">
                      Masukkan informasi akun pengguna.
                    </p>
                  </div>
                </div>

                <form
                  id="user-form"
                  onSubmit={handleSubmit}
                  className="space-y-6"
                >
                  <div className="grid min-w-0 grid-cols-1 gap-x-5 gap-y-5 md:grid-cols-2">
                    <div className="min-w-0 md:col-span-2">
                      <label className="theme-text-secondary mb-1.5 block text-sm font-semibold">
                        Nama Lengkap *
                      </label>
                      <div className="relative">
                        <User
                          size={17}
                          className="theme-text-placeholder pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2"
                        />
                        <input
                          value={formData.namaLengkap}
                          onChange={(e) =>
                            handleChange("namaLengkap", e.target.value)
                          }
                          placeholder="Nama lengkap"
                          className={inputClass(errors.namaLengkap)}
                        />
                      </div>
                      {errors.namaLengkap && (
                        <ErrorText>{errors.namaLengkap}</ErrorText>
                      )}
                    </div>

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

                    <Field
                      label="Nomor Telepon"
                      required
                      icon={<Phone size={17} />}
                      error={errors.noTelepon}
                    >
                      <input
                        type="tel"
                        value={formData.noTelepon}
                        onChange={(e) =>
                          handleChange("noTelepon", e.target.value)
                        }
                        placeholder="08xxxxxxxxxx"
                        className={inputClass(errors.noTelepon)}
                      />
                    </Field>

                    <Field
                      label="Username"
                      required
                      icon={<User size={17} />}
                      error={errors.namaPengguna}
                    >
                      <div className="flex min-w-0 flex-col gap-2 sm:flex-row">
                        <input
                          value={formData.namaPengguna}
                          onChange={(e) =>
                            handleChange("namaPengguna", e.target.value)
                          }
                          placeholder="username"
                          className={`${inputClass(errors.namaPengguna)} min-w-0 flex-1`}
                        />
                        <button
                          type="button"
                          onClick={generateUsername}
                          className="theme-info h-11 shrink-0 rounded-xl border px-4 text-xs font-bold"
                        >
                          Generate
                        </button>
                      </div>
                    </Field>

                    <Field
                      label="Password"
                      required
                      icon={<Shield size={17} />}
                      error={errors.kataSandi}
                    >
                      <div className="flex min-w-0 flex-col gap-2 sm:flex-row">
                        <input
                          type="password"
                          value={formData.kataSandi}
                          onChange={(e) =>
                            handleChange("kataSandi", e.target.value)
                          }
                          placeholder="Minimal 8 karakter"
                          className={`${inputClass(errors.kataSandi)} min-w-0 flex-1`}
                        />
                        <button
                          type="button"
                          onClick={generatePassword}
                          className="theme-info h-11 shrink-0 rounded-xl border px-4 text-xs font-bold"
                        >
                          Generate
                        </button>
                      </div>
                    </Field>

                    <Field
                      label="NIP (opsional)"
                      icon={<Hash size={17} />}
                    >
                      <input
                        value={formData.nip}
                        onChange={(e) =>
                          handleChange("nip", e.target.value)
                        }
                        placeholder="Nomor induk pegawai"
                        className={inputClass(false)}
                      />
                    </Field>

                    <div className="min-w-0">
                      <label className="theme-text-secondary mb-1.5 block text-sm font-semibold">
                        Role *
                      </label>
                      <div className="relative">
                        <Shield
                          size={17}
                          className="theme-text-placeholder pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2"
                        />
                        <select
                          value={formData.peranId}
                          onChange={(e) =>
                            handleChange("peranId", e.target.value)
                          }
                          disabled={isLoadingRoles}
                          className={`${inputClass(errors.peranId)} appearance-none`}
                        >
                          <option value="">
                            {isLoadingRoles ? "Memuat role..." : "Pilih Role"}
                          </option>
                          {roles.map((role) => (
                            <option key={role.id} value={role.id}>
                              {role.namaTampilan || role.nama}
                            </option>
                          ))}
                        </select>
                      </div>
                      {errors.peranId && (
                        <ErrorText>{errors.peranId}</ErrorText>
                      )}
                    </div>

                    {isGuru && (
                      <div className="min-w-0">
                        <label className="theme-text-secondary mb-1.5 block text-sm font-semibold">
                          Shift Kerja *
                        </label>
                        <div className="relative">
                          <Clock
                            size={17}
                            className="theme-text-placeholder pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2"
                          />
                          <select
                            value={formData.shiftKerja}
                            onChange={(e) =>
                              handleChange("shiftKerja", e.target.value)
                            }
                            className={`${inputClass(errors.shiftKerja)} appearance-none`}
                          >
                            <option value="">Pilih shift kerja</option>
                            <option value="pagi">Pagi</option>
                            <option value="siang">Siang</option>
                          </select>
                        </div>
                        {errors.shiftKerja && (
                          <ErrorText>{errors.shiftKerja}</ErrorText>
                        )}
                      </div>
                    )}

                    <div className="min-w-0">
                      <label className="theme-text-secondary mb-1.5 block text-sm font-semibold">
                        Jenis Kelamin
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        {["Laki-laki", "Perempuan"].map((gender) => (
                          <button
                            key={gender}
                            type="button"
                            onClick={() =>
                              handleChange("jenisKelamin", gender)
                            }
                            className={`min-h-11 rounded-xl border px-3 py-2.5 text-sm font-semibold transition ${
                              formData.jenisKelamin === gender
                                ? "border-[var(--color-primary)] bg-[var(--color-info-background)] text-[var(--color-primary)]"
                                : "theme-input"
                            }`}
                          >
                            {gender}
                          </button>
                        ))}
                      </div>
                    </div>

                    <Field
                      label="Tanggal Lahir"
                      icon={<Calendar size={17} />}
                    >
                      <input
                        type="date"
                        value={formData.tanggalLahir}
                        onChange={(e) =>
                          handleChange("tanggalLahir", e.target.value)
                        }
                        className={inputClass(false)}
                      />
                    </Field>

                    <div className="min-w-0 md:col-span-2">
                      <label className="theme-text-secondary mb-1.5 block text-sm font-semibold">
                        Alamat
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
                            handleChange("alamat", e.target.value)
                          }
                          placeholder="Alamat lengkap pengguna"
                          className={`${inputClass(false)} h-auto resize-none`}
                        />
                      </div>
                    </div>
                  </div>

                  {selectedRole && (
                    <div className="theme-info rounded-2xl border p-4">
                      <p className="text-sm font-bold">Role Dipilih</p>
                      <p className="mt-1 text-sm">
                        {selectedRole.namaTampilan || selectedRole.nama}
                      </p>
                      {selectedRole.deskripsi && (
                        <p className="mt-1 text-xs leading-relaxed">
                          {selectedRole.deskripsi}
                        </p>
                      )}
                    </div>
                  )}

                  <div className="theme-info flex items-start gap-3 rounded-2xl border p-4">
                    <Info size={17} className="mt-0.5 shrink-0" />
                    <p className="text-xs leading-relaxed sm:text-sm">
                      Data pengguna akan dikirim ke backend. Untuk akun guru,
                      shift kerja wajib dipilih. Status akun baru ditetapkan
                      sebagai aktif oleh backend.
                    </p>
                  </div>

                  <div className="theme-border-soft flex flex-col-reverse gap-3 border-t pt-5 sm:flex-row sm:justify-end">
                    <button
                      type="button"
                      onClick={() =>
                        router.push("/admin/pengguna/kelola-user")
                      }
                      className="theme-input h-11 rounded-xl px-6 text-sm font-semibold"
                    >
                      Batal
                    </button>
                    <button
                      type="submit"
                      disabled={
                        isSaving || isLoadingRoles || roles.length === 0
                      }
                      className="theme-primary inline-flex h-11 items-center justify-center gap-2 rounded-xl px-6 text-sm font-bold disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {isSaving ? (
                        <>
                          <Loader2 size={17} className="animate-spin" />
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

              <footer className="theme-border border-t py-5 text-center">
                <p className="theme-text-muted text-xs">
                  © 2026 SmartSchool • Tambah User
                </p>
              </footer>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}