"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Sidebar from "@/app/components/Sidebar";
import Header from "@/app/components/Header";
import {
  getUserById,
  updateUser,
} from "@/services/user.service";
import { getRoles } from "@/services/role.service";
import {
  ArrowLeft,
  User,
  Mail,
  Phone,
  Shield,
  Save,
  Lock,
  CheckCircle,
  AlertCircle,
} from "lucide-react";


const themePrimaryGradient =
  "bg-[linear-gradient(135deg,var(--color-primary),color-mix(in_srgb,var(--color-primary)_72%,var(--color-info)))]";

const themePrimarySoft =
  "bg-[color-mix(in_srgb,var(--color-primary)_9%,transparent)]";

const themePrimarySoftBorder =
  "border-[color-mix(in_srgb,var(--color-primary)_22%,transparent)]";

const themePrimaryText =
  "text-[var(--color-primary)]";

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

const themeWarningSurface =
  "bg-[color-mix(in_srgb,var(--color-warning)_9%,transparent)]";

const themeWarningBorder =
  "border-[color-mix(in_srgb,var(--color-warning)_24%,transparent)]";

const themeDangerSurface =
  "bg-[color-mix(in_srgb,var(--color-text)_5%,transparent)]";

const themeDangerBorder =
  "border-[color-mix(in_srgb,var(--color-text)_18%,transparent)]";

const themeFocus =
  "focus:border-[var(--color-primary)] focus:bg-[var(--color-card)] focus:ring-2 focus:ring-[color-mix(in_srgb,var(--color-primary)_14%,transparent)]";


const normalizeRoleName = (value) =>
  String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[\s-]+/g, "_");

const statusOptions = [
  {
    value: "aktif",
    label: "Aktif",
  },
  {
    value: "nonaktif",
    label: "Nonaktif",
  },
];

const getStatusLabel = (status) =>
  String(status || "").toLowerCase() === "aktif"
    ? "Aktif"
    : "Nonaktif";


export default function EditStafPage() {
  const router = useRouter();
  const params = useParams();

  const id = params?.id;

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [loadError, setLoadError] = useState("");
  const [staf, setStaf] = useState(null);
  const [roles, setRoles] = useState([]);
  const [saving, setSaving] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const [formData, setFormData] = useState({
    namaLengkap: "",
    email: "",
    noTelepon: "",
    peranId: "",
    status: "aktif",
    kataSandi: "",
  });


  useEffect(() => {
    let cancelled = false;

    const loadData = async () => {
      if (!id) {
        setNotFound(true);
        setLoading(false);
        return;
      }

      setLoading(true);
      setNotFound(false);
      setLoadError("");

      try {
        const [userResponse, roleData] = await Promise.all([
          getUserById(String(id)),
          getRoles(),
        ]);

        if (cancelled) return;

        const data = userResponse?.data ?? userResponse;

        if (!data?.id) {
          throw new Error("Data staf tidak ditemukan.");
        }

        const roleList = Array.isArray(roleData)
          ? roleData
          : [];

        setStaf(data);
        setRoles(
          roleList.filter(
            (role) =>
              normalizeRoleName(role?.nama) !== "siswa"
          )
        );
        setFormData({
          namaLengkap: data.namaLengkap || "",
          email: data.email || "",
          noTelepon: data.noTelepon || "",
          peranId: data.peran?.id || "",
          status:
            String(data.status || "").toLowerCase() ===
            "nonaktif"
              ? "nonaktif"
              : "aktif",
          kataSandi: "",
        });
      } catch (err) {
        if (cancelled) return;

        console.error(
          "[EditStafPage] Gagal mengambil data staf:",
          err
        );
        setStaf(null);
        setNotFound(true);
        setLoadError(
          err?.message || "Gagal memuat data staf."
        );
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    loadData();

    return () => {
      cancelled = true;
    };
  }, [id]);


  const goBack = () => {
    router.push("/admin/staf");
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (saving) return;

    setSubmitError("");

    if (!formData.peranId) {
      setSubmitError("Role wajib dipilih.");
      return;
    }

    setSaving(true);

    try {
      const payload = {
        namaLengkap: formData.namaLengkap.trim(),
        email: formData.email.trim(),
        noTelepon: formData.noTelepon.trim() || null,
        peranId: formData.peranId,
        status: formData.status,
      };

      if (formData.kataSandi.trim()) {
        payload.kataSandi = formData.kataSandi;
      }

      await updateUser(String(id), payload);
      router.push("/admin/staf");
    } catch (err) {
      console.error(
        "[EditStafPage] Gagal menyimpan data staf:",
        err
      );
      setSubmitError(
        err?.message || "Gagal menyimpan perubahan."
      );
    } finally {
      setSaving(false);
    }
  };


  const sidebar = (
    <div className="shrink-0">
      <Sidebar
        active="staf"
        setActive={() => {}}
        collapsed={!sidebarOpen}
        setCollapsed={() =>
          setSidebarOpen((prev) => !prev)
        }
      />
    </div>
  );


  const header = (
    <Header
      toggleSidebar={() =>
        setSidebarOpen((prev) => !prev)
      }
    />
  );


  if (loading) {
    return (
      <div className="min-h-screen theme-page flex">
        {sidebar}

        <div className="flex-1 min-w-0 flex flex-col">
          {header}

          <main className="flex-1 flex items-center justify-center p-6">
            <div className="flex flex-col items-center gap-3">
              <div
                className={`w-8 h-8 rounded-full border-[3px] border-[var(--color-primary)] border-t-transparent animate-spin`}
              />

              <p className="text-sm theme-text-muted">
                Memuat data staf...
              </p>
            </div>
          </main>
        </div>
      </div>
    );
  }


  if (notFound || !staf) {
    return (
      <div className="min-h-screen theme-page flex">
        {sidebar}

        <div className="flex-1 min-w-0 flex flex-col">
          {header}

          <main className="flex-1 flex items-center justify-center p-6">
            <div className="text-center max-w-sm w-full">
              <div
                className={`w-12 h-12 mx-auto mb-4 rounded-full ${themeDangerSurface} ${themeDangerBorder} border flex items-center justify-center`}
              >
                <AlertCircle
                  size={24}
                  className="theme-danger"
                />
              </div>

              <h2 className="text-base font-semibold theme-text">
                Data staf tidak ditemukan
              </h2>

              <p className="text-sm theme-text-muted mt-1 mb-5">
                {loadError ||
                  "Data staf yang ingin Anda edit tidak tersedia."}
              </p>

              <button
                onClick={goBack}
                className={`inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg ${themePrimaryGradient} text-[var(--color-card)] text-sm font-medium transition hover:opacity-90`}
              >
                <ArrowLeft size={16} />
                Kembali ke Daftar Staf
              </button>
            </div>
          </main>
        </div>
      </div>
    );
  }


  return (
    <div className="min-h-screen theme-page flex">


      {sidebar}


      <div className="flex-1 min-w-0 w-0 flex flex-col">


        {header}


        <main className="flex-1 min-w-0">

          <div className="w-full px-4 sm:px-5 lg:px-6 xl:px-8 py-5 sm:py-6">


            <div className="mb-6">

              <button
                type="button"
                onClick={goBack}
                className={`inline-flex items-center gap-2 text-sm theme-text-secondary hover:text-[var(--color-primary)] transition mb-4`}
              >
                <ArrowLeft size={17} />
                <span>Kembali ke Daftar Staf</span>
              </button>

              <div className="flex items-start gap-3">

                <div
                  className={`w-10 h-10 shrink-0 rounded-lg ${themePrimaryGradient} flex items-center justify-center`}
                >
                  <User
                    size={20}
                    className="text-[var(--color-card)]"
                  />
                </div>

                <div className="min-w-0">
                  <h1 className="text-xl sm:text-2xl font-semibold theme-text">
                    Edit Staf
                  </h1>

                  <p className="text-sm theme-text-muted mt-1">
                    Perbarui informasi akun dan hak akses staf.
                  </p>
                </div>

              </div>
            </div>


            <form
              onSubmit={handleSubmit}
              className="w-full theme-card border theme-border rounded-xl shadow-[0_4px_18px_color-mix(in_srgb,var(--color-text)_5%,transparent)] overflow-hidden"
            >


              <div
                className={`px-4 sm:px-5 lg:px-6 py-5 border-b ${themeDivider} ${themeNeutralSurface}`}
              >

                <div className="flex flex-col sm:flex-row sm:items-center gap-4">


                  <div
                    className={`w-14 h-14 shrink-0 rounded-full ${themePrimarySoft} ${themePrimarySoftBorder} border flex items-center justify-center`}
                  >
                    <span className={`text-sm font-semibold ${themePrimaryText}`}>
                      {(
                        staf.namaLengkap ||
                        staf.namaPengguna ||
                        "?"
                      )
                        .charAt(0)
                        .toUpperCase()}
                    </span>
                  </div>


                  <div className="min-w-0 flex-1">

                    <p className="text-xs theme-text-placeholder mb-1">
                      Akun yang sedang diedit
                    </p>

                    <h2 className="text-base sm:text-lg font-semibold theme-text break-words">
                      {staf.nama}
                    </h2>

                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1">

                      <span className="text-xs theme-text-secondary break-all">
                        {staf.email}
                      </span>

                      <span
                        className={`hidden sm:block w-1 h-1 rounded-full bg-[color-mix(in_srgb,var(--color-text)_20%,transparent)] shrink-0`}
                      />

                      <span className="text-xs theme-text-secondary">
                        {staf.role}
                      </span>

                      <span
                        className={`inline-flex items-center gap-1 text-xs font-medium ${
                          staf.status === "Aktif"
                            ? "text-[var(--color-success)]"
                            : staf.status === "Trial"
                            ? "text-[var(--color-warning)]"
                            : "theme-text-muted"
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            staf.status === "Aktif"
                              ? "bg-[var(--color-success)]"
                              : staf.status === "Trial"
                              ? "bg-[var(--color-warning)]"
                              : "bg-[color-mix(in_srgb,var(--color-text)_35%,transparent)]"
                          }`}
                        />

                        {staf.status}
                      </span>

                    </div>
                  </div>
                </div>
              </div>


              <div className="p-4 sm:p-5 lg:p-6">


                <div className="mb-5">
                  <h3 className="text-sm font-semibold theme-text">
                    Informasi Akun
                  </h3>

                  <p className="text-xs theme-text-muted mt-1">
                    Perbarui informasi dasar staf.
                  </p>
                </div>


                <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-5 gap-y-5">


                  <FormField
                    label="Nama Lengkap"
                    required
                    icon={User}
                  >
                    <input
                      type="text"
                      name="nama"
                      value={formData.nama}
                      onChange={handleChange}
                      required
                      className={inputClass}
                      placeholder="Masukkan nama lengkap"
                    />
                  </FormField>


                  <FormField
                    label="Email"
                    required
                    icon={Mail}
                  >
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className={inputClass}
                      placeholder="Masukkan alamat email"
                    />
                  </FormField>


                  <FormField
                    label="Nomor Telepon"
                    icon={Phone}
                  >
                    <input
                      type="tel"
                      name="telepon"
                      value={formData.telepon}
                      onChange={handleChange}
                      className={inputClass}
                      placeholder="Masukkan nomor telepon"
                    />
                  </FormField>


                  <FormField
                    label="Role"
                    required
                    icon={Shield}
                  >
                    <select
                      name="role"
                      value={formData.role}
                      onChange={handleChange}
                      required
                      className={`${inputClass} appearance-none cursor-pointer`}
                    >
                      <option value="">
                        Pilih role
                      </option>

                      <option value="Super Admin">
                        Super Admin
                      </option>

                      <option value="Admin Sekolah">
                        Admin Sekolah
                      </option>

                      <option value="Admin Yayasan">
                        Admin Yayasan
                      </option>

                      <option value="Guru">
                        Guru
                      </option>

                      <option value="Staf TU">
                        Staf TU
                      </option>
                    </select>
                  </FormField>


                  <FormField
                    label="Status Akun"
                    required
                    icon={CheckCircle}
                  >
                    <select
                      name="status"
                      value={formData.status}
                      onChange={handleChange}
                      required
                      className={`${inputClass} appearance-none cursor-pointer`}
                    >
                      <option value="Aktif">
                        Aktif
                      </option>

                      <option value="Trial">
                        Trial
                      </option>

                      <option value="Nonaktif">
                        Nonaktif
                      </option>
                    </select>
                  </FormField>


                  <div className="lg:col-span-2">

                    <div
                      className={`h-px ${themeNeutralSurface} my-2 mb-6`}
                    />

                    <div className="mb-5">
                      <h3 className="text-sm font-semibold theme-text">
                        Keamanan Akun
                      </h3>

                      <p className="text-xs theme-text-muted mt-1">
                        Ubah password hanya jika diperlukan.
                      </p>
                    </div>

                    <div className="w-full lg:max-w-xl">

                      <FormField
                        label="Password Baru"
                        icon={Lock}
                      >
                        <input
                          type="password"
                          name="password"
                          value={formData.password}
                          onChange={handleChange}
                          minLength={8}
                          className={inputClass}
                          placeholder="Kosongkan jika password tidak diubah"
                        />

                        <p className="text-xs theme-text-muted mt-2">
                          Gunakan minimal 8 karakter untuk password baru.
                        </p>
                      </FormField>

                    </div>
                  </div>

                </div>
              </div>


              <div
                className={`px-4 sm:px-5 lg:px-6 py-4 ${themeNeutralSurface} border-t ${themeDivider}`}
              >

                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">

                  <p className="text-xs theme-text-muted leading-relaxed">
                    Pastikan informasi sudah benar sebelum menyimpan.
                  </p>

                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 shrink-0">

                    <button
                      type="button"
                      onClick={goBack}
                      className={`inline-flex items-center justify-center px-5 py-2.5 rounded-lg border ${themeNeutralBorder} theme-card text-sm font-medium theme-text-secondary ${themeNeutralHover} transition`}
                    >
                      Batal
                    </button>

                    <button
                      type="submit"
                      className={`inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg ${themePrimaryGradient} text-[var(--color-card)] text-sm font-medium transition hover:opacity-90`}
                    >
                      <Save size={16} />
                      <span>Simpan Perubahan</span>
                    </button>

                  </div>
                </div>
              </div>

            </form>
          </div>
        </main>
      </div>
    </div>
  );
}


function FormField({
  label,
  required = false,
  icon: Icon,
  children,
}) {
  return (
    <div className="min-w-0 w-full">

      <label className="block text-xs font-medium theme-text-secondary mb-2">
        {label}

        {required && (
          <span className="theme-danger ml-1">
            *
          </span>
        )}
      </label>

      <div className="relative min-w-0 w-full">

        <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none z-10">
          <Icon
            size={16}
            className="theme-text-placeholder"
          />
        </div>

        {children}

      </div>
    </div>
  );
}


const inputClass = `
  block
  w-full
  min-w-0
  h-10
  sm:h-11
  pl-10
  pr-3
  text-sm
  theme-text
  theme-input
  border
  theme-border
  rounded-lg
  outline-none
  placeholder:text-[var(--color-text-placeholder)]
  ${themeFocus}
  transition
`;