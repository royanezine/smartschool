"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/app/components/Sidebar";
import Header from "@/app/components/Header";
import {
  ArrowLeft,
  User,
  Mail,
  Phone,
  Shield,
  Save,
  UserPlus,
  Lock,
  CheckCircle,
  Info,
  KeyRound,
} from "lucide-react";

// ======================================================
// THEME HELPERS
// ======================================================

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

const themeInfoSurface =
  "bg-[color-mix(in_srgb,var(--color-info)_8%,transparent)]";

const themeInfoBorder =
  "border-[color-mix(in_srgb,var(--color-info)_22%,transparent)]";

const themeWarningSurface =
  "bg-[color-mix(in_srgb,var(--color-warning)_9%,transparent)]";

const themeWarningBorder =
  "border-[color-mix(in_srgb,var(--color-warning)_24%,transparent)]";

const themeFocus =
  "focus:border-[var(--color-primary)] focus:bg-[var(--color-card)] focus:ring-2 focus:ring-[color-mix(in_srgb,var(--color-primary)_14%,transparent)]";

const themeCardShadow =
  "shadow-[0_4px_18px_color-mix(in_srgb,var(--color-text)_5%,transparent)]";

// ======================================================
// PAGE
// ======================================================

export default function TambahStafPage() {
  const router = useRouter();

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeMenu] = useState("staf");

  const [formData, setFormData] = useState({
    nama: "",
    email: "",
    telepon: "",
    role: "",
    status: "Aktif",
    password: "",
  });

  const notifications = [
    {
      id: 1,
      title: "Pembaruan Sistem v2.0",
      desc: "Dikirim 2 jam lalu",
      read: false,
    },
    {
      id: 2,
      title: "Pengingat: Backup Data",
      desc: "Dikirim 1 hari lalu",
      read: false,
    },
  ];

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

  const handleSubmit = (e) => {
    e.preventDefault();

    console.log("Tambah staf:", formData);

    router.push("/admin/staf");
  };

  return (
    <div className="theme-page min-h-screen flex">

      {/* ======================================================
          SIDEBAR
      ====================================================== */}

      <div className="shrink-0">
        <Sidebar
          active={activeMenu}
          setActive={() => {}}
          collapsed={!sidebarOpen}
          setCollapsed={() =>
            setSidebarOpen((prev) => !prev)
          }
        />
      </div>

      {/* ======================================================
          MAIN AREA
      ====================================================== */}

      <div className="flex-1 min-w-0 w-0 flex flex-col">

        {/* HEADER */}

        <Header
          toggleSidebar={() =>
            setSidebarOpen((prev) => !prev)
          }
          notifications={notifications}
          user={{
            name: "Super Admin",
            email: "admin@smartschool.com",
            avatar: "SA",
          }}
        />

        {/* ====================================================
            PAGE CONTENT
        ==================================================== */}

        <main className="flex-1 min-w-0">

          <div className="w-full px-4 sm:px-5 lg:px-7 xl:px-8 py-5 sm:py-6 lg:py-7">

            {/* ==================================================
                PAGE HEADER
            ================================================== */}

            <div className="mb-6">

              {/* BACK BUTTON */}

              <button
                type="button"
                onClick={goBack}
                className={`inline-flex items-center gap-2 text-sm font-medium theme-text-secondary hover:text-[var(--color-primary)] transition-colors mb-5`}
              >
                <ArrowLeft size={17} />
                <span>Kembali ke Daftar Staf</span>
              </button>

              {/* TITLE */}

              <div className="flex items-start gap-3">

                <div
                  className={`w-11 h-11 shrink-0 rounded-xl ${themePrimaryGradient} flex items-center justify-center ${themeCardShadow}`}
                >
                  <UserPlus
                    size={20}
                    strokeWidth={2}
                    className="text-[var(--color-card)]"
                  />
                </div>

                <div className="min-w-0">

                  <h1 className="text-xl sm:text-2xl font-semibold tracking-tight theme-text">
                    Tambah Staf
                  </h1>

                  <p className="mt-1 text-sm theme-text-secondary">
                    Tambahkan akun staf baru dan tentukan hak aksesnya.
                  </p>

                </div>

              </div>
            </div>

            {/* ==================================================
                FORM CONTAINER
            ================================================== */}

            <form
              onSubmit={handleSubmit}
              className={`w-full theme-card border ${themeNeutralBorder} rounded-xl ${themeCardShadow} overflow-hidden`}
            >

              {/* ==================================================
                  FORM HEADER
              ================================================== */}

              <div
                className={`px-5 sm:px-6 lg:px-7 py-5 border-b ${themeDivider} ${themeNeutralSurface}`}
              >

                <div className="flex items-start gap-3">

                  <div
                    className={`w-9 h-9 shrink-0 rounded-lg ${themePrimarySoft} border ${themePrimarySoftBorder} flex items-center justify-center`}
                  >
                    <User
                      size={17}
                      className={themePrimaryText}
                    />
                  </div>

                  <div className="min-w-0">

                    <h2 className="text-sm font-semibold theme-text">
                      Informasi Staf
                    </h2>

                    <p className="text-xs theme-text-secondary mt-1">
                      Lengkapi informasi dasar akun staf yang akan
                      ditambahkan.
                    </p>

                  </div>

                </div>
              </div>

              {/* ==================================================
                  FORM BODY
              ================================================== */}

              <div className="p-5 sm:p-6 lg:p-7">

                {/* ==================================================
                    INFORMASI DASAR
                ================================================== */}

                <div className="mb-5">

                  <div className="flex items-center gap-2 mb-1">

                    <Info
                      size={15}
                      className={themePrimaryText}
                    />

                    <h3 className="text-sm font-semibold theme-text">
                      Informasi Dasar
                    </h3>

                  </div>

                  <p className="text-xs theme-text-muted">
                    Masukkan data pribadi dan kontak staf.
                  </p>

                </div>

                {/* ==================================================
                    FORM GRID
                ================================================== */}

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-6 gap-y-5">

                  {/* ==================================================
                      NAMA
                  ================================================== */}

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
                      autoComplete="name"
                      className={inputClass}
                      placeholder="Masukkan nama lengkap"
                    />
                  </FormField>

                  {/* ==================================================
                      EMAIL
                  ================================================== */}

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
                      autoComplete="email"
                      className={inputClass}
                      placeholder="nama@smartschool.com"
                    />
                  </FormField>

                  {/* ==================================================
                      TELEPON
                  ================================================== */}

                  <FormField
                    label="Nomor Telepon"
                    icon={Phone}
                  >
                    <input
                      type="tel"
                      name="telepon"
                      value={formData.telepon}
                      onChange={handleChange}
                      autoComplete="tel"
                      className={inputClass}
                      placeholder="0812-3456-7890"
                    />
                  </FormField>

                  {/* ==================================================
                      STATUS
                  ================================================== */}

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
                      className={`${inputClass} cursor-pointer appearance-none`}
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

                </div>

                {/* ==================================================
                    ACCESS SECTION
                ================================================== */}

                <div className={`mt-8 pt-7 border-t ${themeDivider}`}>

                  <div className="mb-5">

                    <div className="flex items-center gap-2 mb-1">

                      <Shield
                        size={15}
                        className={themePrimaryText}
                      />

                      <h3 className="text-sm font-semibold theme-text">
                        Hak Akses
                      </h3>

                    </div>

                    <p className="text-xs theme-text-muted">
                      Tentukan role yang akan digunakan oleh staf.
                    </p>

                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-6 gap-y-5">

                    {/* ROLE */}

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
                        className={`${inputClass} cursor-pointer appearance-none`}
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

                    {/* ROLE INFORMATION */}

                    <div
                      className={`flex items-start gap-3 p-3.5 rounded-lg border ${themeInfoBorder} ${themeInfoSurface} min-w-0`}
                    >

                      <div
                        className={`w-8 h-8 shrink-0 rounded-lg theme-card border ${themeNeutralBorder} flex items-center justify-center`}
                      >
                        <KeyRound
                          size={15}
                          className="text-[var(--color-info)]"
                        />
                      </div>

                      <div className="min-w-0">

                        <p className="text-xs font-semibold theme-text">
                          Hak akses staf
                        </p>

                        <p className="text-xs leading-relaxed theme-text-secondary mt-1">
                          Role menentukan menu dan fitur yang dapat
                          diakses oleh staf.
                        </p>

                      </div>

                    </div>

                  </div>
                </div>

                {/* ==================================================
                    SECURITY SECTION
                ================================================== */}

                <div className={`mt-8 pt-7 border-t ${themeDivider}`}>

                  <div className="mb-5">

                    <div className="flex items-center gap-2 mb-1">

                      <Lock
                        size={15}
                        className={themePrimaryText}
                      />

                      <h3 className="text-sm font-semibold theme-text">
                        Keamanan Akun
                      </h3>

                    </div>

                    <p className="text-xs theme-text-muted">
                      Buat password awal untuk akun staf.
                    </p>

                  </div>

                  <div className="w-full lg:max-w-xl">

                    <FormField
                      label="Password"
                      required
                      icon={Lock}
                    >
                      <input
                        type="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        required
                        minLength={8}
                        autoComplete="new-password"
                        className={inputClass}
                        placeholder="Minimal 8 karakter"
                      />

                      <p className="mt-2 text-xs theme-text-muted">
                        Gunakan minimal 8 karakter untuk menjaga
                        keamanan akun.
                      </p>

                    </FormField>

                  </div>
                </div>

              </div>

              {/* ==================================================
                  FOOTER
              ================================================== */}

              <div
                className={`px-5 sm:px-6 lg:px-7 py-4 border-t ${themeDivider} ${themeNeutralSurface}`}
              >

                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">

                  {/* INFORMATION */}

                  <div className="flex items-start gap-2 min-w-0">

                    <Info
                      size={14}
                      className="theme-text-muted mt-0.5 shrink-0"
                    />

                    <p className="text-xs leading-relaxed theme-text-muted">
                      Pastikan data staf sudah benar sebelum menyimpan.
                    </p>

                  </div>

                  {/* BUTTONS */}

                  <div className="flex flex-col sm:flex-row gap-2 shrink-0">

                    <button
                      type="button"
                      onClick={goBack}
                      className={`inline-flex items-center justify-center px-5 py-2.5 text-sm font-medium theme-text-secondary theme-card border ${themeNeutralBorder} rounded-lg ${themeNeutralHover} hover:text-[var(--color-primary)] transition-colors`}
                    >
                      Batal
                    </button>

                    <button
                      type="submit"
                      className={`inline-flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-medium text-[var(--color-card)] ${themePrimaryGradient} rounded-lg shadow-sm hover:opacity-95 active:opacity-90 transition-all`}
                    >
                      <Save size={16} />
                      Simpan Staf
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

// ======================================================
// FORM FIELD
// ======================================================

function FormField({
  label,
  required = false,
  icon: Icon,
  children,
}) {
  return (
    <div className="w-full min-w-0">

      <label className="block text-xs font-medium theme-text-secondary mb-2">
        {label}

        {required && (
          <span className="ml-1 theme-danger">
            *
          </span>
        )}
      </label>

      <div className="relative w-full min-w-0">

        <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none z-10">
          <Icon
            size={16}
            strokeWidth={1.8}
            className="theme-text-muted"
          />
        </div>

        {children}

      </div>
    </div>
  );
}

// ======================================================
// INPUT STYLE
// ======================================================

const inputClass = `
  block w-full min-w-0 h-11 pl-10 pr-3
  text-sm theme-text
  theme-input
  border
  ${themeNeutralBorder}
  rounded-lg
  outline-none
  placeholder:text-[var(--color-text-placeholder)]
  hover:border-[color-mix(in_srgb,var(--color-primary)_30%,var(--color-text)_10%)]
  ${themeFocus}
  transition-all
`;