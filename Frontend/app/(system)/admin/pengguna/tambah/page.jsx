"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Save,
  Loader2,
  UserPlus,
  AlertCircle,
  X,
  CheckCircle2,
} from "lucide-react";

import Sidebar from "../../../components/Sidebar";
import Header from "../../../components/Header";

const API_URL = (
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:5000"
).replace(/\/$/, "");

const getToken = () => {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("token");
};

/* =========================================================
   FORM INPUT
========================================================= */

function FormInput({
  label,
  name,
  type = "text",
  value,
  onChange,
  required = false,
  placeholder = "",
}) {
  return (
    <div>
      <label className="mb-2 block text-xs font-semibold text-slate-600">
        {label}
        {required && (
          <span className="ml-1 text-red-500">*</span>
        )}
      </label>

      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        placeholder={placeholder}
        className="
          h-11
          w-full
          rounded-xl
          border
          border-slate-200
          bg-white
          px-4
          text-sm
          text-slate-800
          outline-none
          transition
          placeholder:text-slate-400
          focus:border-[#155DFC]/50
          focus:ring-2
          focus:ring-[#155DFC]/20
        "
      />
    </div>
  );
}

/* =========================================================
   FORM SELECT
========================================================= */

function FormSelect({
  label,
  name,
  value,
  onChange,
  options,
  required = false,
  disabled = false,
}) {
  return (
    <div>
      <label className="mb-2 block text-xs font-semibold text-slate-600">
        {label}
        {required && (
          <span className="ml-1 text-red-500">*</span>
        )}
      </label>

      <select
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        disabled={disabled}
        className="
          h-11
          w-full
          rounded-xl
          border
          border-slate-200
          bg-white
          px-4
          text-sm
          text-slate-800
          outline-none
          transition
          disabled:cursor-not-allowed
          disabled:bg-slate-50
          disabled:text-slate-400
          focus:border-[#155DFC]/50
          focus:ring-2
          focus:ring-[#155DFC]/20
        "
      >
        <option value="">
          {disabled ? "Memuat..." : `Pilih ${label}`}
        </option>

        {options.map((option) => (
          <option
            key={option.value}
            value={option.value}
          >
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}

/* =========================================================
   PAGE
========================================================= */

export default function TambahPenggunaPage() {
  const router = useRouter();

  const [sidebarOpen, setSidebarOpen] =
    useState(true);

  const [loading, setLoading] =
    useState(false);

  const [loadingData, setLoadingData] =
    useState(true);

  const [error, setError] =
    useState("");

  const [roles, setRoles] =
    useState([]);

  const [sekolahId, setSekolahId] =
    useState("");

  const [form, setForm] = useState({
    namaLengkap: "",
    namaPengguna: "",
    email: "",
    password: "",
    noTelepon: "",
    jabatan: "",
    nip: "",
    nipd: "",
    nisn: "",
    jenisKelamin: "",
    golongan: "",
    peran: "",
  });

  /* =========================================================
     LOAD DATA ROLE + SEKOLAH
  ========================================================= */

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setLoadingData(true);
        setError("");

        const token = getToken();

        if (!token) {
          throw new Error(
            "Token login tidak ditemukan."
          );
        }

        const headers = {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        };

        /* =====================================================
           AMBIL PROFILE ADMIN
           Untuk mendapatkan sekolahId
        ===================================================== */

        const profileResponse =
          await fetch(
            `${API_URL}/api/users/profile`,
            {
              method: "GET",
              headers,
            }
          );

        const profileResult =
          await profileResponse.json();

        console.log(
          "PROFILE ADMIN:",
          profileResult
        );

        if (!profileResponse.ok) {
          throw new Error(
            profileResult?.message ||
              "Gagal mengambil profile pengguna."
          );
        }

        const profile =
          profileResult?.data;

        const currentSekolahId =
          profile?.sekolah?.id || "";

        if (currentSekolahId) {
          setSekolahId(
            currentSekolahId
          );
        }

        /* =====================================================
           AMBIL USERS UNTUK MENDAPATKAN ROLE + ROLE ID

           Backend GET /api/users mengembalikan:
           peran.id
           peran.nama
           peran.namaTampilan
        ===================================================== */

        const usersResponse =
          await fetch(
            `${API_URL}/api/users?page=1&limit=1000`,
            {
              method: "GET",
              headers,
            }
          );

        const usersResult =
          await usersResponse.json();

        console.log(
          "DATA USERS UNTUK ROLE:",
          usersResult
        );

        if (!usersResponse.ok) {
          throw new Error(
            usersResult?.message ||
              "Gagal mengambil data role."
          );
        }

        /* =====================================================
           NORMALISASI DATA USERS

           paginatedResponse bisa memakai data:
           - array langsung
           - atau object tertentu

           Kita handle beberapa kemungkinan.
        ===================================================== */

        let users = [];

        if (
          Array.isArray(
            usersResult?.data
          )
        ) {
          users = usersResult.data;
        } else if (
          Array.isArray(
            usersResult?.data?.data
          )
        ) {
          users =
            usersResult.data.data;
        } else if (
          Array.isArray(
            usersResult?.items
          )
        ) {
          users =
            usersResult.items;
        }

        /* =====================================================
           AMBIL ROLE UNIK
        ===================================================== */

        const roleMap =
          new Map();

        users.forEach((user) => {
          const role =
            user?.peran;

          if (!role?.id) return;

          const roleName =
            String(
              role.nama || ""
            ).toLowerCase();

          const displayName =
            role.namaTampilan ||
            role.nama ||
            "";

          if (!roleMap.has(role.id)) {
            roleMap.set(
              role.id,
              {
                id: role.id,
                nama: roleName,
                namaTampilan:
                  displayName,
              }
            );
          }
        });

        /* =====================================================
           SUSUN ROLE SESUAI URUTAN FORM LAMA
        ===================================================== */

        const preferredRoles = [
          "guru",
          "siswa",
          "staff",
          "staf",
          "admin_sekolah",
        ];

        const foundRoles = [];

        preferredRoles.forEach(
          (preferredName) => {
            const found =
              Array.from(
                roleMap.values()
              ).find(
                (role) =>
                  role.nama ===
                  preferredName
              );

            if (
              found &&
              !foundRoles.some(
                (item) =>
                  item.id ===
                  found.id
              )
            ) {
              foundRoles.push(
                found
              );
            }
          }
        );

        /* =====================================================
           TAMBAHKAN ROLE LAIN JIKA ADA
        ===================================================== */

        Array.from(
          roleMap.values()
        ).forEach((role) => {
          if (
            !foundRoles.some(
              (item) =>
                item.id ===
                role.id
            )
          ) {
            foundRoles.push(
              role
            );
          }
        });

        setRoles(
          foundRoles
        );

        /* =====================================================
           DEBUG
        ===================================================== */

        console.log(
          "ROLE YANG TERSEDIA:",
          foundRoles
        );

        console.log(
          "SEKOLAH ID:",
          currentSekolahId
        );

        if (
          foundRoles.length === 0
        ) {
          console.warn(
            "Tidak ditemukan role dari GET /api/users."
          );
        }
      } catch (err) {
        console.error(
          "LOAD INITIAL DATA ERROR:",
          err
        );

        setError(
          err?.message ||
            "Gagal mengambil data awal."
        );
      } finally {
        setLoadingData(false);
      }
    };

    loadInitialData();
  }, []);

  /* =========================================================
     HANDLE CHANGE
  ========================================================= */

  const handleChange = (e) => {
    const {
      name,
      value,
    } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (error) {
      setError("");
    }
  };

  /* =========================================================
     ROLE OPTIONS
  ========================================================= */

  const roleOptions =
    roles.map((role) => {
      let label =
        role.namaTampilan ||
        role.nama;

      const normalized =
        String(
          role.nama || ""
        ).toLowerCase();

      if (
        normalized ===
        "guru"
      ) {
        label = "Guru";
      }

      if (
        normalized ===
          "staff" ||
        normalized ===
          "staf"
      ) {
        label = "Staff";
      }

      if (
        normalized ===
        "siswa"
      ) {
        label = "Siswa";
      }

      if (
        normalized ===
        "admin_sekolah"
      ) {
        label =
          "Admin Sekolah";
      }

      return {
        value: role.id,
        label,
      };
    });

  /* =========================================================
     HANDLE SUBMIT
  ========================================================= */

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      setError("");

      const token = getToken();

      if (!token) {
        throw new Error(
          "Token login tidak ditemukan."
        );
      }

      /* =====================================================
         VALIDASI
      ===================================================== */

      if (
        !form.namaLengkap.trim()
      ) {
        throw new Error(
          "Nama lengkap wajib diisi."
        );
      }

      if (
        !form.namaPengguna.trim()
      ) {
        throw new Error(
          "Username wajib diisi."
        );
      }

      if (
        !form.email.trim()
      ) {
        throw new Error(
          "Email wajib diisi."
        );
      }

      if (!form.password) {
        throw new Error(
          "Password wajib diisi."
        );
      }

      if (
        form.password.length < 8
      ) {
        throw new Error(
          "Password minimal 8 karakter."
        );
      }

      if (!form.peran) {
        throw new Error(
          "Peran wajib dipilih."
        );
      }

      if (!sekolahId) {
        throw new Error(
          "Sekolah pengguna tidak ditemukan. Silakan login ulang."
        );
      }

      /* =====================================================
         PAYLOAD

         PENTING:
         Backend createUser meminta:

         kataSandi
         peranId

         BUKAN:

         password
         peran
      ===================================================== */

      const payload = {
        namaLengkap:
          form.namaLengkap.trim(),

        namaPengguna:
          form.namaPengguna.trim(),

        email:
          form.email.trim(),

        kataSandi:
          form.password,

        peranId:
          form.peran,

        sekolahId:
          sekolahId,

        noTelepon:
          form.noTelepon.trim() ||
          undefined,

        jabatan:
          form.jabatan.trim() ||
          undefined,

        nip:
          form.nip.trim() ||
          undefined,

        nipd:
          form.nipd.trim() ||
          undefined,

        nisn:
          form.nisn.trim() ||
          undefined,

        jenisKelamin:
          form.jenisKelamin ||
          undefined,

        golongan:
          form.golongan.trim() ||
          undefined,
      };

      /* =====================================================
         DEBUG PAYLOAD
      ===================================================== */

      console.log(
        "PAYLOAD CREATE USER:",
        payload
      );

      /* =====================================================
         POST CREATE USER
      ===================================================== */

      const response =
        await fetch(
          `${API_URL}/api/users`,
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",

              Accept:
                "application/json",

              Authorization:
                `Bearer ${token}`,
            },

            body:
              JSON.stringify(
                payload
              ),
          }
        );

      const result =
        await response.json();

      console.log(
        "RESPONSE CREATE USER:",
        result
      );

      /* =====================================================
         ERROR BACKEND
      ===================================================== */

      if (!response.ok) {
        throw new Error(
          result?.message ||
            "Gagal menambahkan pengguna."
        );
      }

      /* =====================================================
         BERHASIL
      ===================================================== */

      router.push(
        "/admin/pengguna"
      );

      router.refresh();
    } catch (err) {
      console.error(
        "CREATE USER ERROR:",
        err
      );

      setError(
        err?.message ||
          "Gagal menambahkan pengguna."
      );
    } finally {
      setLoading(false);
    }
  };

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <div className="flex h-screen w-full bg-slate-50 overflow-hidden">
      {/* =====================================================
          SIDEBAR
      ===================================================== */}

      <Sidebar
        role="admin"
        activeMenu="pengguna"
        isOpen={sidebarOpen}
        onToggle={() =>
          setSidebarOpen(
            !sidebarOpen
          )
        }
      />

      {/* =====================================================
          MAIN CONTENT
      ===================================================== */}

      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        {/* HEADER */}

        <Header
          title="Tambah Pengguna"
          onMenuClick={() =>
            setSidebarOpen(
              !sidebarOpen
            )
          }
        />

        {/* =====================================================
            PAGE
        ===================================================== */}

        <main className="flex-1 overflow-y-auto">
          <div className="p-4 sm:p-6 lg:p-8 space-y-5 sm:space-y-6">
            {/* =================================================
                PAGE HEADER
            ================================================== */}

            <div
              className="
                flex
                flex-col
                lg:flex-row
                lg:items-center
                lg:justify-between
                gap-4
              "
            >
              {/* TITLE */}

              <div className="flex items-center gap-3">
                <div
                  className="
                    w-11
                    h-11
                    rounded-xl
                    bg-gradient-to-br
                    from-[#155DFC]
                    to-[#0d47c9]
                    text-white
                    flex
                    items-center
                    justify-center
                    shadow-lg
                    shadow-[#155DFC]/20
                    shrink-0
                  "
                >
                  <UserPlus size={20} />
                </div>

                <div className="min-w-0">
                  <h1
                    className="
                      text-xl
                      sm:text-2xl
                      font-bold
                      text-slate-800
                      truncate
                    "
                  >
                    Tambah Pengguna
                  </h1>

                  <p className="text-xs sm:text-sm text-slate-500 mt-1">
                    Tambahkan pengguna baru ke dalam sekolah.
                  </p>
                </div>
              </div>

              {/* ACTION */}

              <div className="flex flex-col sm:flex-row gap-2">
                <button
                  type="button"
                  onClick={() =>
                    router.back()
                  }
                  className="
                    inline-flex
                    items-center
                    justify-center
                    gap-2
                    px-4
                    py-2.5
                    rounded-xl
                    border
                    border-slate-200
                    bg-white
                    text-slate-600
                    text-sm
                    font-semibold
                    hover:bg-slate-50
                    hover:border-slate-300
                    transition
                  "
                >
                  <ArrowLeft size={15} />
                  Kembali
                </button>
              </div>
            </div>

            {/* ERROR */}

            {error && (
              <div
                className="
                  flex
                  items-start
                  gap-3
                  rounded-xl
                  border
                  border-red-200
                  bg-red-50
                  p-4
                "
              >
                <AlertCircle
                  size={19}
                  className="mt-0.5 shrink-0 text-red-600"
                />

                <div className="flex-1">
                  <p className="text-sm font-semibold text-red-800">
                    Terjadi kesalahan
                  </p>

                  <p className="mt-0.5 text-sm text-red-700">
                    {error}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    setError("")
                  }
                  className="text-red-500 hover:text-red-700"
                >
                  <X size={18} />
                </button>
              </div>
            )}

            {/* =================================================
                FORM CARD
            ================================================== */}

            <section
              className="
                bg-white
                rounded-2xl
                border
                border-slate-200/80
                shadow-sm
                overflow-hidden
              "
            >
              {/* FORM HEADER */}

              <div
                className="
                  px-4
                  sm:px-5
                  lg:px-6
                  py-4
                  border-b
                  border-slate-100
                  flex
                  flex-col
                  sm:flex-row
                  sm:items-center
                  sm:justify-between
                  gap-3
                "
              >
                <div>
                  <div className="flex items-center gap-2">
                    <div
                      className="
                        w-8
                        h-8
                        rounded-lg
                        bg-[#eaf1ff]
                        border
                        border-[#c7dbff]
                        flex
                        items-center
                        justify-center
                      "
                    >
                      <UserPlus
                        size={15}
                        className="text-[#155DFC]"
                      />
                    </div>

                    <h2 className="text-sm font-bold text-slate-800">
                      Informasi Pengguna
                    </h2>
                  </div>

                  <p className="text-xs text-slate-400 mt-1">
                    Isi informasi dasar pengguna dengan lengkap.
                  </p>
                </div>
              </div>

              {/* FORM BODY */}

              <form onSubmit={handleSubmit}>
                <div className="p-4 sm:p-6 lg:p-8">
                  <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                    <FormInput
                      label="Nama Lengkap"
                      name="namaLengkap"
                      value={
                        form.namaLengkap
                      }
                      onChange={
                        handleChange
                      }
                      required
                      placeholder="Masukkan nama lengkap"
                    />

                    <FormInput
                      label="Username"
                      name="namaPengguna"
                      value={
                        form.namaPengguna
                      }
                      onChange={
                        handleChange
                      }
                      required
                      placeholder="Masukkan username"
                    />

                    <FormInput
                      label="Email"
                      name="email"
                      type="email"
                      value={
                        form.email
                      }
                      onChange={
                        handleChange
                      }
                      required
                      placeholder="nama@email.com"
                    />

                    <FormInput
                      label="Password"
                      name="password"
                      type="password"
                      value={
                        form.password
                      }
                      onChange={
                        handleChange
                      }
                      required
                      placeholder="Minimal 8 karakter"
                    />

                    <FormInput
                      label="No. Telepon"
                      name="noTelepon"
                      value={
                        form.noTelepon
                      }
                      onChange={
                        handleChange
                      }
                      placeholder="08xxxxxxxxxx"
                    />

                    <FormSelect
                      label="Peran"
                      name="peran"
                      value={
                        form.peran
                      }
                      onChange={
                        handleChange
                      }
                      required
                      disabled={
                        loadingData ||
                        roles.length === 0
                      }
                      options={
                        roleOptions
                      }
                    />

                    <FormInput
                      label="Jabatan"
                      name="jabatan"
                      value={
                        form.jabatan
                      }
                      onChange={
                        handleChange
                      }
                      placeholder="Contoh: Guru Matematika"
                    />

                    <FormInput
                      label="NIP"
                      name="nip"
                      value={
                        form.nip
                      }
                      onChange={
                        handleChange
                      }
                      placeholder="Nomor Induk Pegawai"
                    />

                    <FormInput
                      label="NIPD"
                      name="nipd"
                      value={
                        form.nipd
                      }
                      onChange={
                        handleChange
                      }
                      placeholder="Nomor Induk Peserta Didik"
                    />

                    <FormInput
                      label="NISN"
                      name="nisn"
                      value={
                        form.nisn
                      }
                      onChange={
                        handleChange
                      }
                      placeholder="Nomor Induk Siswa Nasional"
                    />

                    <FormSelect
                      label="Jenis Kelamin"
                      name="jenisKelamin"
                      value={
                        form.jenisKelamin
                      }
                      onChange={
                        handleChange
                      }
                      options={[
                        {
                          value: "L",
                          label: "Laki-laki",
                        },
                        {
                          value: "P",
                          label: "Perempuan",
                        },
                      ]}
                    />

                    <FormInput
                      label="Golongan"
                      name="golongan"
                      value={
                        form.golongan
                      }
                      onChange={
                        handleChange
                      }
                      placeholder="Contoh: III/a"
                    />
                  </div>
                </div>

                {/* FORM FOOTER */}

                <div
                  className="
                    px-4
                    sm:px-5
                    lg:px-6
                    py-4
                    border-t
                    border-slate-100
                    bg-slate-50/70
                    flex
                    flex-col
                    sm:flex-row
                    sm:justify-end
                    gap-2
                  "
                >
                  <button
                    type="button"
                    onClick={() =>
                      router.back()
                    }
                    disabled={
                      loading
                    }
                    className="
                      inline-flex
                      items-center
                      justify-center
                      gap-2
                      px-4
                      py-2.5
                      rounded-xl
                      border
                      border-slate-200
                      bg-white
                      text-slate-600
                      text-sm
                      font-semibold
                      hover:bg-slate-50
                      transition
                      disabled:opacity-50
                      disabled:cursor-not-allowed
                    "
                  >
                    <X size={15} />
                    Batal
                  </button>

                  <button
                    type="submit"
                    disabled={
                      loading ||
                      loadingData ||
                      roles.length === 0
                    }
                    className="
                      inline-flex
                      items-center
                      justify-center
                      gap-2
                      px-4
                      py-2.5
                      rounded-xl
                      bg-gradient-to-r
                      from-[#155DFC]
                      to-[#0d47c9]
                      text-white
                      text-sm
                      font-semibold
                      shadow-sm
                      hover:brightness-110
                      transition
                      disabled:cursor-not-allowed
                      disabled:opacity-60
                    "
                  >
                    {loading ? (
                      <>
                        <Loader2
                          size={15}
                          className="animate-spin"
                        />
                        Menyimpan...
                      </>
                    ) : loadingData ? (
                      <>
                        <Loader2
                          size={15}
                          className="animate-spin"
                        />
                        Memuat data...
                      </>
                    ) : (
                      <>
                        <Save size={15} />
                        Simpan Pengguna
                      </>
                    )}
                  </button>
                </div>
              </form>
            </section>

            {/* =================================================
                INFO CARD
            ================================================== */}

            <section
              className="
                bg-white
                rounded-2xl
                border
                border-slate-200/80
                shadow-sm
                overflow-hidden
              "
            >
              <div className="p-4 sm:p-5 lg:p-6">
                <div className="flex items-start gap-3">
                  <div
                    className="
                      w-8
                      h-8
                      rounded-lg
                      bg-[#eaf1ff]
                      border
                      border-[#c7dbff]
                      flex
                      items-center
                      justify-center
                      shrink-0
                    "
                  >
                    <CheckCircle2
                      size={15}
                      className="text-[#155DFC]"
                    />
                  </div>

                  <div className="min-w-0">
                    <h3 className="text-sm font-bold text-slate-800">
                      Petunjuk Pengisian
                    </h3>

                    <ul className="mt-2 space-y-1.5 text-xs text-slate-500">
                      <li className="flex items-start gap-2">
                        <span className="mt-1.5 w-1 h-1 rounded-full bg-slate-400 shrink-0" />

                        <span>
                          Field bertanda{" "}
                          <span className="text-red-500 font-semibold">
                            *
                          </span>{" "}
                          wajib diisi.
                        </span>
                      </li>

                      <li className="flex items-start gap-2">
                        <span className="mt-1.5 w-1 h-1 rounded-full bg-slate-400 shrink-0" />

                        <span>
                          Password minimal 8 karakter dengan kombinasi huruf dan angka.
                        </span>
                      </li>

                      <li className="flex items-start gap-2">
                        <span className="mt-1.5 w-1 h-1 rounded-full bg-slate-400 shrink-0" />

                        <span>
                          NIP untuk Guru/Staff, NIPD & NISN untuk Siswa.
                        </span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </main>
      </div>
    </div>
  );
}