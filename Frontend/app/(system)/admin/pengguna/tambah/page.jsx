"use client";

import { useEffect, useState } from "react";
import { getProfile, getUsers, createUser } from "@/services/user.service";
import { getToken } from "@/lib/auth";
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
import Sidebar from "@/app/components/Sidebar";
import Header from "@/app/components/Header";

const API_URL = (
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"
).replace(/\/$/, "");



const themePrimarySoft =
  "bg-[color-mix(in_srgb,var(--color-primary)_10%,transparent)]";

const themePrimarySoftBorder =
  "border-[color-mix(in_srgb,var(--color-primary)_25%,transparent)]";

const themePrimaryFocus =
  "focus:border-[color-mix(in_srgb,var(--color-primary)_50%,transparent)] focus:ring-2 focus:ring-[color-mix(in_srgb,var(--color-primary)_20%,transparent)]";

const themeTextHover =
  "hover:bg-[color-mix(in_srgb,var(--color-text)_5%,transparent)]";

const themePrimaryShadow =
  "shadow-[0_8px_24px_color-mix(in_srgb,var(--color-primary)_18%,transparent)]";


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
      <label className="mb-2 block text-xs font-semibold theme-text-secondary">
        {label}
        {required && (
          <span className="ml-1 theme-danger">*</span>
        )}
      </label>

      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        placeholder={placeholder}
        className={`
          h-11
          w-full
          rounded-xl
          border
          theme-border
          theme-input
          px-4
          text-sm
          theme-text
          outline-none
          transition
          placeholder:text-[var(--color-text-placeholder)]
          ${themePrimaryFocus}
        `}
      />
    </div>
  );
}


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
      <label className="mb-2 block text-xs font-semibold theme-text-secondary">
        {label}
        {required && (
          <span className="ml-1 theme-danger">*</span>
        )}
      </label>

      <select
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        disabled={disabled}
        className={`
          h-11
          w-full
          rounded-xl
          border
          theme-border
          theme-input
          px-4
          text-sm
          theme-text
          outline-none
          transition
          disabled:cursor-not-allowed
          disabled:opacity-60
          ${themePrimaryFocus}
        `}
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


export default function TambahPenggunaPage() {
  const router = useRouter();

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [error, setError] = useState("");
  const [roles, setRoles] = useState([]);
  const [sekolahId, setSekolahId] = useState("");

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


  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setLoadingData(true);
        setError("");

        const profileResult = await getProfile();

        const profile =
          profileResult?.data;

        const currentSekolahId =
          profile?.sekolah?.id || "";

        if (currentSekolahId) {
          setSekolahId(currentSekolahId);
        }

        const usersResult = await getUsers({ page: 1, limit: 1000 });


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


        const roleMap = new Map();

        users.forEach((user) => {
          const role = user?.peran;

          if (!role?.id) return;

          const roleName = String(
            role.nama || ""
          ).toLowerCase();

          const displayName =
            role.namaTampilan ||
            role.nama ||
            "";

          if (!roleMap.has(role.id)) {
            roleMap.set(role.id, {
              id: role.id,
              nama: roleName,
              namaTampilan:
                displayName,
            });
          }
        });


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
              foundRoles.push(found);
            }
          }
        );


        Array.from(
          roleMap.values()
        ).forEach((role) => {
          if (
            !foundRoles.some(
              (item) =>
                item.id === role.id
            )
          ) {
            foundRoles.push(role);
          }
        });

        setRoles(foundRoles);

        console.log(
          "ROLE YANG TERSEDIA:",
          foundRoles
        );

        console.log(
          "SEKOLAH ID:",
          currentSekolahId
        );

        if (foundRoles.length === 0) {
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


  const roleOptions = roles.map((role) => {
    let label =
      role.namaTampilan ||
      role.nama;

    const normalized = String(
      role.nama || ""
    ).toLowerCase();

    if (normalized === "guru") {
      label = "Guru";
    }

    if (
      normalized === "staff" ||
      normalized === "staf"
    ) {
      label = "Staff";
    }

    if (normalized === "siswa") {
      label = "Siswa";
    }

    if (
      normalized ===
      "admin_sekolah"
    ) {
      label = "Admin Sekolah";
    }

    return {
      value: role.id,
      label,
    };
  });


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

      if (!form.email.trim()) {
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

      console.log(
        "PAYLOAD CREATE USER:",
        payload
      );


      const response = await fetch(
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


      if (!response.ok) {
        throw new Error(
          result?.message ||
            "Gagal menambahkan pengguna."
        );
      }


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


  return (
    <div className="flex h-screen w-full theme-page overflow-hidden">

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


      <div className="flex flex-1 min-w-0 h-full flex-col overflow-hidden">

        <Header
          title="Tambah Pengguna"
          onMenuClick={() =>
            setSidebarOpen(
              !sidebarOpen
            )
          }
        />


        <main className="flex-1 overflow-y-auto">
          <div className="space-y-5 p-4 sm:space-y-6 sm:p-6 lg:p-8">

            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

              <div className="flex items-center gap-3">
                <div
                  className={`
                    flex
                    h-11
                    w-11
                    shrink-0
                    items-center
                    justify-center
                    rounded-xl
                    bg-[var(--color-primary)]
                    text-white
                    ${themePrimaryShadow}
                  `}
                >
                  <UserPlus size={20} />
                </div>

                <div className="min-w-0">
                  <h1 className="truncate text-xl font-bold theme-text sm:text-2xl">
                    Tambah Pengguna
                  </h1>

                  <p className="mt-1 text-xs theme-text-secondary sm:text-sm">
                    Tambahkan pengguna baru ke dalam sekolah.
                  </p>
                </div>
              </div>


              <div className="flex flex-col gap-2 sm:flex-row">
                <button
                  type="button"
                  onClick={() =>
                    router.back()
                  }
                  className={`
                    inline-flex
                    items-center
                    justify-center
                    gap-2
                    rounded-xl
                    border
                    theme-border
                    theme-card
                    px-4
                    py-2.5
                    text-sm
                    font-semibold
                    theme-text-secondary
                    transition
                    ${themeTextHover}
                  `}
                >
                  <ArrowLeft size={15} />
                  Kembali
                </button>
              </div>
            </div>


            {error && (
              <div
                className="
                  theme-danger
                  flex
                  items-start
                  gap-3
                  rounded-xl
                  border
                  p-4
                "
              >
                <AlertCircle
                  size={19}
                  className="mt-0.5 shrink-0"
                />

                <div className="flex-1">
                  <p className="text-sm font-semibold">
                    Terjadi kesalahan
                  </p>

                  <p className="mt-0.5 text-sm opacity-90">
                    {error}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    setError("")
                  }
                  className="opacity-70 transition hover:opacity-100"
                >
                  <X size={18} />
                </button>
              </div>
            )}


            <section
              className="
                theme-card
                theme-border
                overflow-hidden
                rounded-2xl
                border
                shadow-[0_6px_24px_color-mix(in_srgb,var(--color-text)_6%,transparent)]
              "
            >

              <div
                className="
                  flex
                  flex-col
                  gap-3
                  border-b
                  theme-border-soft
                  px-4
                  py-4
                  sm:flex-row
                  sm:items-center
                  sm:justify-between
                  sm:px-5
                  lg:px-6
                "
              >
                <div>
                  <div className="flex items-center gap-2">
                    <div
                      className={`
                        flex
                        h-8
                        w-8
                        items-center
                        justify-center
                        rounded-lg
                        border
                        ${themePrimarySoft}
                        ${themePrimarySoftBorder}
                      `}
                    >
                      <UserPlus
                        size={15}
                        className="text-[var(--color-primary)]"
                      />
                    </div>

                    <h2 className="text-sm font-bold theme-text">
                      Informasi Pengguna
                    </h2>
                  </div>

                  <p className="mt-1 text-xs theme-text-muted">
                    Isi informasi dasar pengguna dengan lengkap.
                  </p>
                </div>
              </div>


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
                      value={form.email}
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
                      value={form.peran}
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
                      value={form.nip}
                      onChange={
                        handleChange
                      }
                      placeholder="Nomor Induk Pegawai"
                    />

                    <FormInput
                      label="NIPD"
                      name="nipd"
                      value={form.nipd}
                      onChange={
                        handleChange
                      }
                      placeholder="Nomor Induk Peserta Didik"
                    />

                    <FormInput
                      label="NISN"
                      name="nisn"
                      value={form.nisn}
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


                <div
                  className="
                    flex
                    flex-col
                    gap-2
                    border-t
                    theme-border-soft
                    theme-card-soft
                    px-4
                    py-4
                    sm:flex-row
                    sm:justify-end
                    sm:px-5
                    lg:px-6
                  "
                >
                  <button
                    type="button"
                    onClick={() =>
                      router.back()
                    }
                    disabled={loading}
                    className={`
                      inline-flex
                      items-center
                      justify-center
                      gap-2
                      rounded-xl
                      border
                      theme-border
                      theme-card
                      px-4
                      py-2.5
                      text-sm
                      font-semibold
                      theme-text-secondary
                      transition
                      disabled:cursor-not-allowed
                      disabled:opacity-50
                      ${themeTextHover}
                    `}
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
                      rounded-xl
                      bg-[var(--color-primary)]
                      px-4
                      py-2.5
                      text-sm
                      font-semibold
                      text-white
                      shadow-sm
                      transition
                      hover:brightness-110
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


            <section
              className="
                theme-card
                theme-border
                overflow-hidden
                rounded-2xl
                border
                shadow-[0_6px_24px_color-mix(in_srgb,var(--color-text)_6%,transparent)]
              "
            >
              <div className="p-4 sm:p-5 lg:p-6">
                <div className="flex items-start gap-3">
                  <div
                    className={`
                      flex
                      h-8
                      w-8
                      shrink-0
                      items-center
                      justify-center
                      rounded-lg
                      border
                      ${themePrimarySoft}
                      ${themePrimarySoftBorder}
                    `}
                  >
                    <CheckCircle2
                      size={15}
                      className="text-[var(--color-primary)]"
                    />
                  </div>

                  <div className="min-w-0">
                    <h3 className="text-sm font-bold theme-text">
                      Petunjuk Pengisian
                    </h3>

                    <ul className="mt-2 space-y-1.5 text-xs theme-text-secondary">
                      <li className="flex items-start gap-2">
                        <span
                          className="
                            mt-1.5
                            h-1
                            w-1
                            shrink-0
                            rounded-full
                            bg-[var(--color-text-muted)]
                          "
                        />

                        <span>
                          Field bertanda{" "}
                          <span className="font-semibold theme-danger">
                            *
                          </span>{" "}
                          wajib diisi.
                        </span>
                      </li>

                      <li className="flex items-start gap-2">
                        <span
                          className="
                            mt-1.5
                            h-1
                            w-1
                            shrink-0
                            rounded-full
                            bg-[var(--color-text-muted)]
                          "
                        />

                        <span>
                          Password minimal 8 karakter dengan kombinasi huruf dan angka.
                        </span>
                      </li>

                      <li className="flex items-start gap-2">
                        <span
                          className="
                            mt-1.5
                            h-1
                            w-1
                            shrink-0
                            rounded-full
                            bg-[var(--color-text-muted)]
                          "
                        />

                        <span>
                          NIP untuk Guru/Staff, NIPD &amp; NISN untuk Siswa.
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