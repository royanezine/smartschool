"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Sidebar from "../../../../components/Sidebar";
import Header from "../../../../components/Header";
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

// ======================================================
// DATA DUMMY
// ======================================================

const stafData = [
  {
    id: 1,
    nama: "Dr. Ahmad Fauzi, M.Pd.",
    email: "ahmad.fauzi@smartschool.com",
    telepon: "0812-3456-7890",
    role: "Super Admin",
    status: "Aktif",
    terakhirLogin: "2026-08-26T08:30:00Z",
    bergabung: "2024-01-15",
    avatar: "AF",
  },
  {
    id: 2,
    nama: "Dewi Lestari, S.Kom.",
    email: "dewi.lestari@smartschool.com",
    telepon: "0813-4567-8901",
    role: "Admin Sekolah",
    status: "Aktif",
    terakhirLogin: "2026-08-25T14:20:00Z",
    bergabung: "2024-02-10",
    avatar: "DL",
  },
  {
    id: 3,
    nama: "Budi Santoso, S.E.",
    email: "budi.santoso@smartschool.com",
    telepon: "0814-5678-9012",
    role: "Admin Yayasan",
    status: "Aktif",
    terakhirLogin: "2026-08-24T09:15:00Z",
    bergabung: "2024-03-01",
    avatar: "BS",
  },
  {
    id: 4,
    nama: "Siti Rahayu, S.Pd.",
    email: "siti.rahayu@smartschool.com",
    telepon: "0815-6789-0123",
    role: "Guru",
    status: "Nonaktif",
    terakhirLogin: "2026-08-20T11:00:00Z",
    bergabung: "2024-04-15",
    avatar: "SR",
  },
  {
    id: 5,
    nama: "M. Rizki Firmansyah, S.Si.",
    email: "rizki.firmansyah@smartschool.com",
    telepon: "0816-7890-1234",
    role: "Staf TU",
    status: "Trial",
    terakhirLogin: "2026-08-22T16:45:00Z",
    bergabung: "2024-05-20",
    avatar: "RF",
  },
];

// ======================================================
// PAGE
// ======================================================

export default function EditStafPage() {
  const router = useRouter();
  const params = useParams();

  const id = params?.id;

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const [staf, setStaf] = useState(null);

  const [formData, setFormData] = useState({
    nama: "",
    email: "",
    telepon: "",
    role: "",
    status: "",
    password: "",
  });

  // ======================================================
  // NOTIFICATIONS
  // ======================================================

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

  // ======================================================
  // LOAD DATA
  // ======================================================

  useEffect(() => {
    if (!id) return;

    const found = stafData.find(
      (item) => item.id === Number(id)
    );

    if (found) {
      setStaf(found);

      setFormData({
        nama: found.nama,
        email: found.email,
        telepon: found.telepon || "",
        role: found.role,
        status: found.status,
        password: "",
      });
    } else {
      setNotFound(true);
    }

    setLoading(false);
  }, [id]);

  // ======================================================
  // ACTION
  // ======================================================

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

    const payload = {
      id,
      nama: formData.nama,
      email: formData.email,
      telepon: formData.telepon,
      role: formData.role,
      status: formData.status,
      ...(formData.password
        ? { password: formData.password }
        : {}),
    };

    console.log("Update staf:", payload);

    router.push("/admin/staf");
  };

  // ======================================================
  // SIDEBAR
  // ======================================================

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

  // ======================================================
  // HEADER
  // ======================================================

  const header = (
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
  );

  // ======================================================
  // LOADING
  // ======================================================

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex">
        {sidebar}

        <div className="flex-1 min-w-0 flex flex-col">
          {header}

          <main className="flex-1 flex items-center justify-center p-6">
            <div className="flex flex-col items-center gap-3">
              <div className="w-8 h-8 rounded-full border-[3px] border-blue-600 border-t-transparent animate-spin" />

              <p className="text-sm text-slate-500">
                Memuat data staf...
              </p>
            </div>
          </main>
        </div>
      </div>
    );
  }

  // ======================================================
  // NOT FOUND
  // ======================================================

  if (notFound || !staf) {
    return (
      <div className="min-h-screen bg-slate-50 flex">
        {sidebar}

        <div className="flex-1 min-w-0 flex flex-col">
          {header}

          <main className="flex-1 flex items-center justify-center p-6">
            <div className="text-center max-w-sm w-full">
              <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-rose-50 border border-rose-100 flex items-center justify-center">
                <AlertCircle
                  size={24}
                  className="text-rose-500"
                />
              </div>

              <h2 className="text-base font-semibold text-slate-800">
                Data staf tidak ditemukan
              </h2>

              <p className="text-sm text-slate-500 mt-1 mb-5">
                Data staf yang ingin Anda edit tidak tersedia.
              </p>

              <button
                onClick={goBack}
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium transition"
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

  // ======================================================
  // MAIN
  // ======================================================

  return (
    <div className="min-h-screen bg-slate-50 flex">

      {/* ==================================================
          SIDEBAR
      ================================================== */}

      {sidebar}

      {/* ==================================================
          MAIN CONTENT
      ================================================== */}

      <div className="flex-1 min-w-0 w-0 flex flex-col">

        {/* HEADER */}

        {header}

        {/* CONTENT */}

        <main className="flex-1 min-w-0">

          <div className="w-full px-4 sm:px-5 lg:px-6 xl:px-8 py-5 sm:py-6">

            {/* ==================================================
                PAGE HEADER
            ================================================== */}

            <div className="mb-6">

              <button
                type="button"
                onClick={goBack}
                className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-blue-600 transition mb-4"
              >
                <ArrowLeft size={17} />
                <span>Kembali ke Daftar Staf</span>
              </button>

              <div className="flex items-start gap-3">

                <div className="w-10 h-10 shrink-0 rounded-lg bg-blue-600 flex items-center justify-center">
                  <User
                    size={20}
                    className="text-white"
                  />
                </div>

                <div className="min-w-0">
                  <h1 className="text-xl sm:text-2xl font-semibold text-slate-800">
                    Edit Staf
                  </h1>

                  <p className="text-sm text-slate-500 mt-1">
                    Perbarui informasi akun dan hak akses staf.
                  </p>
                </div>

              </div>
            </div>

            {/* ==================================================
                FORM
            ================================================== */}

            <form
              onSubmit={handleSubmit}
              className="w-full bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden"
            >

              {/* ==================================================
                  PROFILE SUMMARY
              ================================================== */}

              <div className="px-4 sm:px-5 lg:px-6 py-5 border-b border-slate-200 bg-slate-50/50">

                <div className="flex flex-col sm:flex-row sm:items-center gap-4">

                  {/* AVATAR */}

                  <div className="w-14 h-14 shrink-0 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center">
                    <span className="text-sm font-semibold text-blue-600">
                      {staf.avatar}
                    </span>
                  </div>

                  {/* INFO */}

                  <div className="min-w-0 flex-1">

                    <p className="text-xs text-slate-400 mb-1">
                      Akun yang sedang diedit
                    </p>

                    <h2 className="text-base sm:text-lg font-semibold text-slate-800 break-words">
                      {staf.nama}
                    </h2>

                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1">

                      <span className="text-xs text-slate-500 break-all">
                        {staf.email}
                      </span>

                      <span className="hidden sm:block w-1 h-1 rounded-full bg-slate-300 shrink-0" />

                      <span className="text-xs text-slate-500">
                        {staf.role}
                      </span>

                      <span
                        className={`inline-flex items-center gap-1 text-xs font-medium ${
                          staf.status === "Aktif"
                            ? "text-emerald-600"
                            : staf.status === "Trial"
                            ? "text-amber-600"
                            : "text-slate-500"
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            staf.status === "Aktif"
                              ? "bg-emerald-500"
                              : staf.status === "Trial"
                              ? "bg-amber-500"
                              : "bg-slate-400"
                          }`}
                        />

                        {staf.status}
                      </span>

                    </div>
                  </div>
                </div>
              </div>

              {/* ==================================================
                  FORM BODY
              ================================================== */}

              <div className="p-4 sm:p-5 lg:p-6">

                {/* SECTION */}

                <div className="mb-5">
                  <h3 className="text-sm font-semibold text-slate-800">
                    Informasi Akun
                  </h3>

                  <p className="text-xs text-slate-400 mt-1">
                    Perbarui informasi dasar staf.
                  </p>
                </div>

                {/* ==================================================
                    FORM GRID
                ================================================== */}

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-5 gap-y-5">

                  {/* NAMA */}

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

                  {/* EMAIL */}

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

                  {/* TELEPON */}

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

                  {/* STATUS */}

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

                  {/* ==================================================
                      SECURITY
                  ================================================== */}

                  <div className="lg:col-span-2">

                    <div className="h-px bg-slate-200 my-2 mb-6" />

                    <div className="mb-5">
                      <h3 className="text-sm font-semibold text-slate-800">
                        Keamanan Akun
                      </h3>

                      <p className="text-xs text-slate-400 mt-1">
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

                        <p className="text-xs text-slate-400 mt-2">
                          Gunakan minimal 8 karakter untuk password baru.
                        </p>
                      </FormField>

                    </div>
                  </div>

                </div>
              </div>

              {/* ==================================================
                  FOOTER
              ================================================== */}

              <div className="px-4 sm:px-5 lg:px-6 py-4 bg-slate-50/70 border-t border-slate-200">

                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">

                  <p className="text-xs text-slate-400 leading-relaxed">
                    Pastikan informasi sudah benar sebelum menyimpan.
                  </p>

                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 shrink-0">

                    <button
                      type="button"
                      onClick={goBack}
                      className="inline-flex items-center justify-center px-5 py-2.5 rounded-lg border border-slate-200 bg-white text-sm font-medium text-slate-600 hover:bg-slate-50 transition"
                    >
                      Batal
                    </button>

                    <button
                      type="submit"
                      className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium shadow-sm transition"
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
    <div className="min-w-0 w-full">

      <label className="block text-xs font-medium text-slate-600 mb-2">
        {label}

        {required && (
          <span className="text-rose-500 ml-1">
            *
          </span>
        )}
      </label>

      <div className="relative min-w-0 w-full">

        <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none z-10">
          <Icon
            size={16}
            className="text-slate-400"
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

const inputClass =
  "block w-full min-w-0 h-10 sm:h-11 pl-10 pr-3 text-sm text-slate-700 bg-white border border-slate-200 rounded-lg outline-none placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 transition";